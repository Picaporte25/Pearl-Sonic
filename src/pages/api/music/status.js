import { supabaseAdmin } from '@/lib/db';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';
import falClient from '@/lib/fal';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { trackId } = req.query;

  if (!trackId) {
    return res.status(400).json({ error: 'trackId is required' });
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

    // Find track
    const { data: track, error: findError } = await supabaseAdmin
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .eq('user_id', userId)
      .single();

    if (findError || !track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // If already completed, return immediately
    if (track.status === 'completed') {
      return res.status(200).json({
        status: track.status,
        audioUrl: track.audio_url,
        title: track.title,
        progress: 100,
      });
    }

    // Check if track has a Fal request ID
    if (!track.fal_request_id) {
      return res.status(200).json({
        status: 'completed',
        audioUrl: track.audio_url,
        title: track.title,
        progress: 100,
      });
    }

    // Poll Fal.ai for status
    const falResult = await falClient.getStatus(track.fal_request_id);

    if (!falResult.success) {
      console.error('Fal error:', falResult.error);
      return res.status(200).json({
        status: track.status,
        audioUrl: track.audio_url,
        title: track.title,
        progress: 0,
      });
    }

    // Update track based on Fal result
    const updateData = {};

    if (falResult.status === 'completed') {
      updateData.status = 'completed';
      updateData.audio_url = falResult.audioUrl;
      updateData.title = falResult.title || track.title;
      updateData.progress = 100;
    } else if (falResult.status === 'failed') {
      updateData.status = 'failed';
    } else {
      updateData.progress = falResult.progress || 0;
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('tracks')
        .update(updateData)
        .eq('id', trackId);

      if (updateError) {
        console.error('Error updating track:', updateData, updateError);
      }
    }

    res.status(200).json({
      status: updateData.status || track.status,
      audioUrl: updateData.audio_url || track.audio_url,
      title: updateData.title || track.title,
      progress: updateData.progress !== undefined ? updateData.progress : track.progress,
    });
  } catch (error) {
    console.error('Error in status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
