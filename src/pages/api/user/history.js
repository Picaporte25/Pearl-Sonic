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

    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit, 10) : undefined;

    let query = supabaseAdmin
      .from('tracks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (limitNum) {
      query = query.limit(limitNum);
    }

    const { data: tracks, error } = await query;

    if (error) {
      console.error('Error fetching history:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Convert snake_case to camelCase for backward compatibility
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      userId: track.user_id,
      sunoId: track.suno_id,
      title: track.title,
      description: track.description,
      genre: track.genre,
      mood: track.mood,
      duration: track.duration,
      status: track.status,
      audioUrl: track.audio_url,
      coverUrl: track.cover_url,
      creditsUsed: track.credits_used,
      progress: track.progress,
      createdAt: track.created_at,
    }));

    res.status(200).json({ tracks: formattedTracks });
  } catch (error) {
    console.error('Error en history:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
