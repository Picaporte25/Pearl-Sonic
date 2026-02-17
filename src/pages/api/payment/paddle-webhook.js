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
    // Tell Next.js to parse the body as raw string for signature verification
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Apply rate limit check
  const rateLimitResult = rateLimitMiddleware(req, res, () => {
    // This is a no-op, rateLimitMiddleware handles the check
  });

  // If rate limited, the response is already sent
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

    // In production, ALWAYS verify the signature
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

      case 'subscription.activated':
        await handleSubscriptionActivated(data);
        break;

      case 'subscription.updated':
        await handleSubscriptionUpdated(data);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(data);
        break;

      case 'subscription.past_due':
        await handleSubscriptionPastDue(data);
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

    // Calculate credits from the price
    let creditsToAdd = 0;
    if (items && items.length > 0) {
      const priceId = items[0].price_id;
      creditsToAdd = getCreditsFromPriceId(priceId);

      // If we can't find the plan, try to calculate from the total amount
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
    // Log the failed payment
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

// Handle subscription activated (first payment of subscription)
async function handleSubscriptionActivated(data) {
  try {
    const { custom_data, items, subscription_id, id: transactionId } = data;

    if (!custom_data || !custom_data.userId) {
      console.error('Missing userId in custom_data');
      return;
    }

    const userId = custom_data.userId;

    // Calculate credits from the price
    let creditsToAdd = 0;
    if (items && items.length > 0) {
      const priceId = items[0].price_id;
      creditsToAdd = getCreditsFromPriceId(priceId);
    }

    console.log(`Subscription activated for user ${userId}, adding ${creditsToAdd} credits`);

    // Update user credits
    const { error: updateError } = await supabase
      .from('users')
      .update({
        credits: supabase.raw(`credits + ${creditsToAdd}`),
        paddle_subscription_id: subscription_id,
        subscription_active: true,
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
      type: 'subscription_activated',
      description: `Subscription activated: ${transactionId}`,
      metadata: {
        paddleSubscriptionId: subscription_id,
        paddleTransactionId: transactionId,
        paymentMethod: 'paddle',
        paymentType: 'subscription',
      },
    });

    console.log(`Subscription activated for user ${userId}`);

  } catch (error) {
    console.error('Error handling subscription.activated:', error);
  }
}

// Handle subscription updated (plan change or renewal)
async function handleSubscriptionUpdated(data) {
  try {
    const { custom_data, items, subscription_id } = data;

    if (!custom_data || !custom_data.userId) {
      console.error('Missing userId in custom_data');
      return;
    }

    const userId = custom_data.userId;

    // Calculate credits from the price
    let creditsToAdd = 0;
    if (items && items.length > 0) {
      const priceId = items[0].price_id;
      creditsToAdd = getCreditsFromPriceId(priceId);
    }

    console.log(`Subscription updated for user ${userId}, adding ${creditsToAdd} credits`);

    // Update user credits and subscription info
    const { error: updateError } = await supabase
      .from('users')
      .update({
        credits: supabase.raw(`credits + ${creditsToAdd}`),
        paddle_subscription_id: subscription_id,
        subscription_active: true,
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
      type: 'subscription_renewed',
      description: `Subscription renewed: ${subscription_id}`,
      metadata: {
        paddleSubscriptionId: subscription_id,
        paymentMethod: 'paddle',
        paymentType: 'subscription',
      },
    });

    console.log(`Subscription renewed for user ${userId}`);

  } catch (error) {
    console.error('Error handling subscription.updated:', error);
  }
}

// Handle subscription cancelled
async function handleSubscriptionCancelled(data) {
  try {
    const { custom_data, subscription_id } = data;

    if (!custom_data || !custom_data.userId) {
      console.error('Missing userId in custom_data');
      return;
    }

    const userId = custom_data.userId;

    console.log(`Subscription cancelled for user ${userId}`);

    // Update user to mark subscription as inactive
    // Keep the credits - user keeps what they've paid for
    const { error: updateError } = await supabase
      .from('users')
      .update({
        paddle_subscription_id: null,
        subscription_active: false,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return;
    }

    // Record cancellation
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: 0,
      type: 'subscription_cancelled',
      description: `Subscription cancelled: ${subscription_id}`,
      metadata: {
        paddleSubscriptionId: subscription_id,
        paymentMethod: 'paddle',
      },
    });

    console.log(`Subscription cancelled for user ${userId} - credits kept`);

  } catch (error) {
    console.error('Error handling subscription.cancelled:', error);
  }
}

// Handle subscription past due (payment failed)
async function handleSubscriptionPastDue(data) {
  console.log('Subscription past due:', { subscription_id: data.subscription_id });

  const { custom_data } = data;

  if (custom_data && custom_data.userId) {
    // Log the failed payment
    await supabase.from('credit_transactions').insert({
      user_id: custom_data.userId,
      amount: 0,
      type: 'subscription_payment_failed',
      description: 'Subscription payment failed',
      metadata: {
        paddleSubscriptionId: data.subscription_id,
        paymentMethod: 'paddle',
      },
    });
  }
}
