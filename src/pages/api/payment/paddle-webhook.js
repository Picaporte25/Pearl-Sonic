// Paddle Webhook Handler
// This endpoint receives payment notifications from Paddle

import { supabaseAdmin } from '@/lib/db';
import { getCreditsFromPriceId } from '@/lib/paddle';
import { verifyPaddleWebhookSignature, getRawBody } from '@/lib/webhook-verify';
import { rateLimit } from '@/lib/rate-limit';

const rateLimitMiddleware = rateLimit('webhook');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const rateLimitResult = rateLimitMiddleware(req, res, () => {});

  if (rateLimitResult?.statusCode === 429) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);

    const signature = req.headers['paddle-signature'];
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

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

    const body = JSON.parse(rawBody);
    const { event_type, data } = body;

    console.log('[webhook] received:', event_type, data.id);

    // Process BEFORE responding so Supabase calls don't get killed
    switch (event_type) {
      case 'transaction.completed':
        await handleTransactionCompleted(data);
        break;

      case 'transaction.payment_failed':
        await handlePaymentFailed(data);
        break;

      default:
        console.log(`[webhook] ignored event: ${event_type}`);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Paddle webhook error:', error);
    return res.status(200).json({ received: true, error: 'Processing error' });
  }
}

async function handleTransactionCompleted(data) {
  const { custom_data, items, id: transactionId } = data;

  if (!custom_data?.userId) {
    console.error('[webhook] Missing userId in custom_data');
    return;
  }

  const userId = custom_data.userId;

  // --- Idempotency: check if already processed ---
  const { data: existing } = await supabaseAdmin
    .from('credit_transactions')
    .select('id')
    .eq('description', `Paddle payment: ${transactionId}`)
    .maybeSingle();

  if (existing) {
    console.log(`[webhook] Transaction ${transactionId} already processed, skipping`);
    return;
  }

  // --- Calculate credits ---
  const priceId = items?.[0]?.price?.id;
  const creditsToAdd = getCreditsFromPriceId(priceId);

  if (creditsToAdd === 0) {
    console.error(`[webhook] Unknown priceId: ${priceId}, no credits added`);
    return;
  }

  // --- Record transaction FIRST (lock against duplicates) ---
  const { error: insertError } = await supabaseAdmin
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: creditsToAdd,
      type: 'purchase',
      description: `Paddle payment: ${transactionId}`,
    });

  if (insertError) {
    console.error('[webhook] Failed to record transaction (likely duplicate):', insertError);
    return;
  }

  // --- Update credits ---
  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('[webhook] Error fetching user:', fetchError);
    return;
  }

  const newCredits = (user.credits || 0) + creditsToAdd;

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ credits: newCredits })
    .eq('id', userId);

  if (updateError) {
    console.error('[webhook] Error updating credits:', updateError);
    return;
  }

  console.log(`[webhook] Added ${creditsToAdd} credits to user ${userId}, total: ${newCredits}`);

  // --- Broadcast update via Supabase Realtime ---
  try {
    const channel = supabaseAdmin.channel(`user-credits:${userId}`);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Broadcast subscribe timeout')), 5000);
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(timeout);
          resolve();
        }
      });
    });
    await channel.send({
      type: 'broadcast',
      event: 'credits_updated',
      payload: { credits: newCredits },
    });
    await supabaseAdmin.removeChannel(channel);
    console.log(`[webhook] Broadcast sent to user-credits:${userId}`);
  } catch (err) {
    console.error('[webhook] Broadcast failed (credits still saved):', err.message);
  }
}

async function handlePaymentFailed(data) {
  console.log('[webhook] Payment failed:', data.id);

  if (data.custom_data?.userId) {
    await supabaseAdmin.from('credit_transactions').insert({
      user_id: data.custom_data.userId,
      amount: 0,
      type: 'payment_failed',
      description: `Paddle payment failed: ${data.id}`,
    });
  }
}
