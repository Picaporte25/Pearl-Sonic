// Paddle Webhook Handler
// This endpoint receives payment notifications from Paddle

import { supabaseAdmin } from '@/lib/db';
import { getCreditsFromPriceId, getPlanFromPriceId } from '@/lib/paddle';
import { verifyPaddleWebhookSignature, getRawBody } from '@/lib/webhook-verify';
import { rateLimit } from '@/lib/rate-limit';

// Apply rate limiting to webhook (10 requests per minute)
const rateLimitMiddleware = rateLimit('webhook');

export const config = {
  api: {
    // Tell Next.js to parse body as raw string for signature verification
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Apply rate limit check
  const rateLimitResult = rateLimitMiddleware(req, res, () => {
    // This is a no-op, rateLimitMiddleware handles check
  });

  // If rate limited, response is already sent
  if (rateLimitResult?.statusCode === 429) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req);

    // Verify webhook signature (CRITICAL FOR SECURITY)
    const signature = req.headers['paddle-signature'];
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

    // Always verify webhook signature
    if (!signature) {
      console.error('Missing paddle-signature header');
      return res.status(401).json({ error: 'Missing signature' });
    }

    if (!webhookSecret || webhookSecret === 'your_paddle_webhook_secret_here') {
      console.error('PADDLE_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const isValidSignature = verifyPaddleWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValidSignature) {
      console.error('Invalid webhook signature - possible spoofing attempt');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse JSON body only after verifying signature
    const body = JSON.parse(rawBody);
    console.log('Paddle webhook received:', { event_type: body.event_type });

    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // Extract event data (Paddle v2 uses event_type, not event_name)
    const { event_type, data } = body;

    // Handle different event types
    switch (event_type) {
      case 'transaction.paid':
        await handlePaymentSucceeded(data, res);
        break;

      case 'transaction.completed':
        await handleTransactionCompleted(data, res);
        break;

      case 'transaction.payment_failed':
        await handlePaymentFailed(data);
        break;

      default:
        console.log(`Unhandled event: ${event_type}`);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Paddle webhook error:', error);
    // Still return 200 to prevent Paddle from retrying
    return res.status(200).json({ received: true, error: 'Processing error' });
  }
}

// Handle successful payment (one-time purchase)
async function handlePaymentSucceeded(data, res) {
  try {
    const { custom_data, items, id: transactionId } = data;

    if (!custom_data || !custom_data.userId) {
      console.error('Missing userId in custom_data');
      return;
    }

    const userId = custom_data.userId;

    // Calculate credits from price (Paddle v2: price ID is at items[].price.id)
    let creditsToAdd = 0;
    if (items && items.length > 0) {
      const priceId = items[0].price?.id;
      creditsToAdd = getCreditsFromPriceId(priceId);

      // If we can't find plan, try to calculate from total amount
      if (creditsToAdd === 0 && data.details?.totals?.total) {
        const totalCents = parseInt(data.details.totals.total, 10);
        const usdAmount = totalCents / 100;
        creditsToAdd = Math.floor(usdAmount * 3);
      }
    }

    console.log(`Adding ${creditsToAdd} credits to user ${userId} (one-time purchase)`);

    // Get current credits then update
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user credits:', fetchError);
      return;
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ credits: (user.credits || 0) + creditsToAdd })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user credits:', updateError);
      return;
    }

    // Record transaction
    await supabaseAdmin.from('credit_transactions').insert({
      user_id: userId,
      amount: creditsToAdd,
      type: 'purchase',
      description: `Paddle payment: ${transactionId}`,
      metadata: {
        paddleTransactionId: transactionId,
        paymentMethod: 'paddle',
        paymentType: 'one-time',
      },
    });

    console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`);

    // Emit real-time update via Socket.IO
    const newCredits = (user.credits || 0) + creditsToAdd;
    const io = res?.socket?.server?.io;
    if (io) {
      io.to(`user:${userId}`).emit('user:update', { credits: newCredits });
    }

  } catch (error) {
    console.error('Error handling payment.succeeded:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(data) {
  console.log('Payment failed:', { id: data.id });

  const { custom_data } = data;

  if (custom_data && custom_data.userId) {
    // Log failed payment
    await supabaseAdmin.from('credit_transactions').insert({
      user_id: custom_data.userId,
      amount: 0,
      type: 'payment_failed',
      description: 'Paddle payment failed',
      metadata: {
        paddleTransactionId: data.id,
        paymentMethod: 'paddle',
      },
    });
  }
}

// Handle transaction completed (one-time purchase)
async function handleTransactionCompleted(data, res) {
  return await handlePaymentSucceeded(data, res);
}
