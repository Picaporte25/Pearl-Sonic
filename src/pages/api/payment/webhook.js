import connectDB from '@/lib/db';
import { User, CreditTransaction } from '@/lib/models';
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

      await connectDB();

      // Buscar usuario y actualizar créditos
      const user = await User.findById(userId);
      if (user) {
        const creditsToAdd = parseInt(credits, 10);
        user.credits += creditsToAdd;
        await user.save();

        // Registrar transacción
        const transaction = new CreditTransaction({
          userId: user._id,
          amount: creditsToAdd,
          type: 'purchase',
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          description: `Compra de ${creditsToAdd} créditos`,
        });
        await transaction.save();

        console.log(`Créditos actualizados para usuario ${userId}: ${creditsToAdd} créditos añadidos`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
