import connectDB from '@/lib/db';
import { CreditTransaction } from '@/lib/models';
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

    await connectDB();

    const transactions = await CreditTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ transactions });
  } catch (error) {
    console.error('Error en transactions:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
