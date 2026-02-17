import { supabaseAdmin } from '@/lib/db';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Paquetes de créditos
const PACKAGES = {
  10: { credits: 10, price: 500 },    // $5
  25: { credits: 25, price: 1000 },   // $10
  50: { credits: 50, price: 1800 },   // $18
  100: { credits: 100, price: 3000 }, // $30
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { package: packageKey } = req.body;

  const pkg = PACKAGES[packageKey];

  if (!pkg) {
    return res.status(400).json({ error: 'Paquete inválido' });
  }

  try {
    const token = getTokenFromCookies(req);

    if (!token) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const userId = verifyToken(token);

    if (!userId) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Crear sesión de checkout de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pkg.credits} Créditos - Sound-Weaver`,
              description: 'Los créditos nunca expiran',
            },
            unit_amount: pkg.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
      metadata: {
        userId: userId,
        credits: pkg.credits.toString(),
        amount: pkg.price.toString(),
      },
    });

    res.status(200).json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Error al crear checkout:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
