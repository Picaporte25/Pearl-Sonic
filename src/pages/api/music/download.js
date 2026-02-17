import { supabaseAdmin } from '@/lib/db';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { trackId } = req.query;

  if (!trackId) {
    return res.status(400).json({ error: 'trackId es requerido' });
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

    // Verify ownership
    const { data: track, error } = await supabaseAdmin
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .eq('user_id', userId)
      .single();

    if (error || !track) {
      return res.status(404).json({ error: 'Track no encontrado' });
    }

    if (!track.audio_url) {
      return res.status(400).json({ error: 'El track aún no está disponible para descarga' });
    }

    // Redirigir a la URL del audio
    res.redirect(302, track.audio_url);
  } catch (error) {
    console.error('Error en download:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
