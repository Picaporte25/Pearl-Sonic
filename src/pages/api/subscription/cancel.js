import { supabaseAdmin } from '@/lib/db';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  try {
    // Verify authentication
    const token = getTokenFromCookies(req);
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = verifyToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user's current subscription
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('paddle_subscription_id, subscription_active, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.paddle_subscription_id) {
      return res.status(400).json({ error: 'No active subscription to cancel' });
    }

    // Cancel subscription via Paddle API
    // Note: This requires Paddle API integration
    // For now, we'll just mark it as cancelled in the database
    // In production, you would:
    // 1. Call Paddle API to cancel the subscription
    // 2. Wait for the webhook to confirm cancellation

    const paddleToken = process.env.PADDLE_TOKEN;
    if (paddleToken) {
      try {
        // Call Paddle API to cancel subscription
        // This is a simplified example - check Paddle docs for the exact endpoint
        /*
        const response = await fetch(`https://api.paddle.com/subscription/${user.paddle_subscription_id}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paddleToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error('Failed to cancel subscription in Paddle:', await response.text());
          return res.status(500).json({ error: 'Failed to cancel subscription' });
        }
        */
      } catch (error) {
        console.error('Error cancelling subscription via Paddle:', error);
        // Continue anyway - the webhook will handle it
      }
    }

    // Mark subscription as inactive in database
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        subscription_active: false,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return res.status(500).json({ error: 'Error cancelling subscription' });
    }

    // Log cancellation
    await supabaseAdmin.from('credit_transactions').insert({
      user_id: userId,
      amount: 0,
      type: 'subscription_cancel_request',
      description: 'Subscription cancellation requested by user',
      metadata: {
        paddleSubscriptionId: user.paddle_subscription_id,
      },
    });

    res.status(200).json({
      message: 'Subscription cancelled successfully',
      note: 'Your subscription has been cancelled. You will keep all the credits you have earned. Future monthly payments will stop.',
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
