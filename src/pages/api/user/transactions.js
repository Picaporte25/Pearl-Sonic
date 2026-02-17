import { supabaseAdmin } from '@/lib/db';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
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

    const { data: transactions, error } = await supabaseAdmin
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Convert snake_case to camelCase for backward compatibility
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      userId: transaction.user_id,
      amount: transaction.amount,
      type: transaction.type,
      stripePaymentIntentId: transaction.stripe_payment_intent_id,
      stripeCheckoutSessionId: transaction.stripe_checkout_session_id,
      trackId: transaction.track_id,
      description: transaction.description,
      createdAt: transaction.created_at,
    }));

    res.status(200).json({ transactions: formattedTransactions });
  } catch (error) {
    console.error('Error en transactions:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
