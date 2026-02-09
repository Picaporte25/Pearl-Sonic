import connectDB from '@/lib/db';
import { User, Track, CreditTransaction } from '@/lib/models';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';
import sunoClient from '@/lib/suno';

const CREDITS_PER_TRACK = 2; // Credits needed per song

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, genre, mood, duration } = req.body;

  // Validate fields
  if (!prompt || !genre || !mood || !duration) {
    return res.status(400).json({ error: 'All fields are required' });
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

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check credits
    if (user.credits < CREDITS_PER_TRACK) {
      return res.status(402).json({
        error: 'Not enough credits',
        required: CREDITS_PER_TRACK,
        available: user.credits,
      });
    }

    // Generate music with Suno AI
    const sunoResult = await sunoClient.generate({ prompt, genre, mood, duration });

    if (!sunoResult.success) {
      return res.status(500).json({ error: sunoResult.error || 'Error generating music' });
    }

    // Deduct credits
    user.credits -= CREDITS_PER_TRACK;
    await user.save();

    // Create track record
    const track = new Track({
      userId: user._id,
      sunoId: sunoResult.jobId,
      title: `${genre} - ${mood}`,
      description: prompt,
      genre,
      mood,
      duration,
      status: 'generating',
      creditsUsed: CREDITS_PER_TRACK,
    });

    await track.save();

    // Create credit transaction
    const transaction = new CreditTransaction({
      userId: user._id,
      amount: -CREDITS_PER_TRACK,
      type: 'usage',
      description: `Track generation: ${prompt.substring(0, 50)}...`,
    });
    await transaction.save();

    res.status(200).json({
      message: 'Generation started',
      trackId: track._id,
      jobId: sunoResult.jobId,
      estimatedTime: sunoResult.estimatedTime,
      creditsUsed: CREDITS_PER_TRACK,
      remainingCredits: user.credits,
    });
  } catch (error) {
    console.error('Error in generate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
