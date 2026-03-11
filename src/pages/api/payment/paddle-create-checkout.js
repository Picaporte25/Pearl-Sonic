// API endpoint to create Paddle checkout session
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId, email } = req.body;

    // Validate inputs
    if (!priceId || !userId || !email) {
      console.error('Missing fields:', { priceId, userId, email });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if Paddle API key is configured
    const apiKey = process.env.PADDLE_API_KEY;
    if (!apiKey || apiKey === 'your-paddle-api-key-here') {
      console.error('Paddle API key not configured');
      return res.status(500).json({
        error: 'Paddle not configured. Please set up your Paddle API key.',
      });
    }

    console.log('Creating checkout session for:', { priceId, userId, email });

    // Create checkout session using Paddle API
    const checkoutData = {
      items: [
        {
          price_id: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      settings: {
        success_url: `${req.headers.origin || 'https://pearl-sonic.vercel.app'}/checkout-paddle/success`,
        cancel_url: `${req.headers.origin || 'https://pearl-sonic.vercel.app'}/checkout-paddle`,
      },
    };

    console.log('Sending to Paddle API:', JSON.stringify(checkoutData, null, 2));

    // Call Paddle API
    const response = await fetch('https://api.paddle.com/transactions/checkout-session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Paddle response:', responseText);
      data = { error: { message: 'Invalid response from Paddle API' } };
    }

    console.log('Paddle API response:', { status: response.status, data });

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || data.message || 'Failed to create checkout session',
        details: data,
      });
    }

    // Return the checkout URL
    return res.status(200).json({
      success: true,
      checkoutUrl: data.data?.url,
    });

  } catch (error) {
    console.error('Paddle checkout error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      stack: error.stack,
    });
  }
}
