import { supabaseAdmin } from '@/lib/db';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

// PayPal pricing (USD): 5 USD = 1 credit
const CREDITS_PER_USD = 5;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = getTokenFromCookies(req);

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = verifyToken(token);

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { credits, packageLabel } = req.body;

    if (!credits || !packageLabel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate price in USD
    const priceInUsd = credits * CREDITS_PER_USD;

    // Generate a unique order ID
    const orderId = `SW_${Date.now()}_${userId}`;

    // Create order object
    const order = {
      id: orderId,
      userId: userId,
      credits: credits,
      packageLabel,
      amountUsd: priceInUsd,
      currency: 'USD',
      status: 'pending',
      createdAt: new Date(),
    };

    res.status(200).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
