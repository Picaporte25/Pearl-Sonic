// Paddle Webhook Handler
// This endpoint receives payment notifications from Paddle

import { supabase } from '@/lib/db';
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

    // In production, ALWAYS verify signature
    // In development, you can skip this if you don't have a Paddle account yet
    if (process.env.NODE_ENV === 'production') {
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
    }

    // Parse JSON body only after verifying signature
    const body = JSON.parse(rawBody);
    console.log('Paddle webhook received:', { event_name: body.event_name });

    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // Extract event data
    const { event_name, data } = body;

    // Handle different event types
    switch (event_name) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(data);
        break;

      case 'payment.completed':
        await handlePaymentCompleted(data);
        break;

      case 'payment.failed':
        await handlePaymentFailed(data);
        break;

      case 'transaction.completed':
        await handleTransactionCompleted(data);
        break;

      default:
        console.log(`Unhandled event: ${event_name}`);
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
async function handlePaymentSucceeded(data) {
  try {
    const { custom_data, items, id: transactionId } = data;

    if (!custom_data || !custom_data.userId) {
      console.error('Missing userId in custom_data');
      return;
    }

    const userId = custom_data.userId;

    // Calculate credits from price
    let creditsToAdd = 0;
    if (items && items.length > 0) {
      const priceId = items[0].price_id;
      creditsToAdd = getCreditsFromPriceId(priceId);

      // If we can't find plan, try to calculate from total amount
      if (creditsToAdd === 0 && items[0].price) {
        const priceAmount = items[0].price.gross; // in cents
        const usdAmount = priceAmount / 100;
        // Roughly 3 credits per USD
        creditsToAdd = Math.floor(usdAmount * 3);
      }
    }

    console.log(`Adding ${creditsToAdd} credits to user ${userId} (one-time purchase)`);

    // Update user credits
    const { error: updateError } = await supabase
      .from('users')
      .update({
        credits: supabase.raw(`credits + ${creditsToAdd}`),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user credits:', updateError);
      return;
    }

    // Record transaction
    await supabase.from('credit_transactions').insert({
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

  } catch (error) {
    console.error('Error handling payment.succeeded:', error);
  }
}

// Handle completed payment (similar to succeeded)
async function handlePaymentCompleted(data) {
  return await handlePaymentSucceeded(data);
}

// Handle failed payment
async function handlePaymentFailed(data) {
  console.log('Payment failed:', { id: data.id });

  const { custom_data } = data;

  if (custom_data && custom_data.userId) {
    // Log failed payment
    await supabase.from('credit_transactions').insert({
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
async function handleTransactionCompleted(data) {
  return await handlePaymentSucceeded(data);
}
