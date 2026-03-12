// API endpoint to create Paddle transaction and return checkout URL
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId, email } = req.body;

    if (!priceId || !userId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.PADDLE_API_KEY;
    if (!apiKey || apiKey === 'your-paddle-api-key-here') {
      return res.status(500).json({
        error: 'Paddle not configured. Please set up your Paddle API key.',
      });
    }

    const isSandbox = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';

    const response = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        custom_data: { userId, email },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.detail || 'Failed to create transaction',
        details: data,
      });
    }

    const checkoutUrl = data.data?.checkout?.url;

    return res.status(200).json({
      success: true,
      transactionId: data.data?.id,
      checkoutUrl,
    });

  } catch (error) {
    console.error('Paddle checkout error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
