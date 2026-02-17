import { supabaseAdmin } from '@/lib/db';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

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

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // PayPal sends IPN as webhook notification
    const {
      resource_type,
      event_type,
      resource_id,
      payment_status,
      payment_id,
      payment_gross,
      payer_id,
      payer_email,
      payer_name,
      transaction_id,
      transaction_status,
      amount_gross,
      amount_fee,
      amount_refund,
      custom_id,
      create_time,
      update_time,
      app_id,
    } = req.body;

    // Verify webhook notification from PayPal
    const payPalWebhookUrl = `https://ipnpb.sandbox.paypal.com/cgi-bin/webscr`;

    if (event_type !== 'PAYMENT.CAPTURE.COMPLETED' && event_type !== 'PAYMENT.CAPTURE.DENIED') {
      return res.status(200).json({ received: true, message: 'Event received but not captured' });
    }

    const creditsToAdd = Math.floor(amount_gross / 5); // 5 USD per credit

    if (payment_status !== 'COMPLETED' || creditsToAdd <= 0) {
      return res.status(200).json({ received: true, message: 'Payment not completed' });
    }

    // Update user credits
    const newCredits = user.credits + creditsToAdd;
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ credits: newCredits })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return res.status(500).json({ error: 'Error updating credits' });
    }

    // Record transaction
    const { error: transError } = await supabaseAdmin
      .from('credit_transactions')
      .insert([{
        user_id: user.id,
        amount: creditsToAdd,
        type: 'purchase',
        description: `PayPal purchase of ${creditsToAdd} credits`,
      }]);

    if (transError) {
      console.error('Error creating transaction:', transError);
      // Don't fail the request if transaction logging fails
    }

    res.status(200).json({ received: true, message: 'Payment processed successfully' });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
