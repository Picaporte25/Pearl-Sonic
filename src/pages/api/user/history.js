import connectDB from '@/lib/db';
import { Track } from '@/lib/models';
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

    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit, 10) : undefined;

    const tracks = await Track.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limitNum);

    res.status(200).json({ tracks });
  } catch (error) {
    console.error('Error en history:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
