import { supabaseAdmin } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      console.error('Error verificando webhook:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Manejar evento checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { userId, credits, amount } = session.metadata;

      // Buscar usuario y actualizar créditos
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!userError && user) {
        const creditsToAdd = parseInt(credits, 10);
        const newCredits = user.credits + creditsToAdd;

        // Actualizar créditos
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ credits: newCredits })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating credits:', updateError);
        } else {
          // Registrar transacción
          const { error: transError } = await supabaseAdmin
            .from('credit_transactions')
            .insert([{
              user_id: user.id,
              amount: creditsToAdd,
              type: 'purchase',
              stripe_payment_intent_id: session.payment_intent,
              stripe_checkout_session_id: session.id,
              description: `Compra de ${creditsToAdd} créditos`,
            }]);

          if (transError) {
            console.error('Error creating transaction:', transError);
          } else {
            console.log(`Créditos actualizados para usuario ${userId}: ${creditsToAdd} créditos añadidos`);
          }
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
