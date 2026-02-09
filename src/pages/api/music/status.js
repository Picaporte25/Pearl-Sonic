import connectDB from '@/lib/db';
import { Track } from '@/lib/models';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';
import sunoClient from '@/lib/suno';

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

    await connectDB();

    const track = await Track.findOne({ _id: trackId, userId });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // If already completed, return immediately
    if (track.status === 'completed') {
      return res.status(200).json({
        status: track.status,
        audioUrl: track.audioUrl,
        coverUrl: track.coverUrl,
        title: track.title,
        progress: 100,
      });
    }

    // Check if track has a Suno job ID
    if (!track.sunoId) {
      return res.status(200).json({
        status: 'completed',
        audioUrl: track.audioUrl,
        coverUrl: track.coverUrl,
        title: track.title,
        progress: 100,
      });
    }

    // Poll Suno AI for status
    const sunoResult = await sunoClient.getStatus(track.sunoId);

    if (!sunoResult.success) {
      console.error('Suno error:', sunoResult.error);
      return res.status(200).json({
        status: track.status,
        audioUrl: track.audioUrl,
        coverUrl: track.coverUrl,
        title: track.title,
        progress: 0,
      });
    }

    // Update track based on Suno result
    if (sunoResult.status === 'completed') {
      track.status = 'completed';
      track.audioUrl = sunoResult.audioUrl;
      track.coverUrl = sunoResult.coverUrl;
      track.title = sunoResult.title || track.title;
      track.progress = 100;
    } else if (sunoResult.status === 'failed') {
      track.status = 'failed';
    } else {
      track.progress = sunoResult.progress || 0;
    }

    await track.save();

    res.status(200).json({
      status: track.status,
      audioUrl: track.audioUrl,
      coverUrl: track.coverUrl,
      title: track.title,
      progress: track.progress,
    });
  } catch (error) {
    console.error('Error in status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
