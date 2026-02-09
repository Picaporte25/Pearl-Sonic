import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

// PayPal pricing (ARS to USD conversion: 5 USD = 1 credit
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

    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate price in ARS (5000 ARS = 1 USD approx)
    const priceInArs = credits * 5000;

    // Generate a unique order ID
    const orderId = `SW_${Date.now()}_${userId}`;

    // Create order object
    const order = {
      id: orderId,
      userId: user._id.toString(),
      credits: credits,
      packageLabel,
      amountArs: priceInArs,
      amountUsd: priceInArs / 5000, // Convert to USD for display
      currency: 'ARS',
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
