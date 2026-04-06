import { supabaseAdmin } from '@/lib/db';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';
import falClient from '@/lib/fal';

const DEFAULT_DURATION = 120000; // Default: 2 minutes in milliseconds

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, duration, forceInstrumental, outputFormat } = req.body;

  // Validate fields - only prompt is required now
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Description is required' });
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

    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate credits needed: 1 credit = 1 second
    const finalDuration = duration || DEFAULT_DURATION;
    const durationSeconds = Math.ceil(finalDuration / 1000);
    const creditsNeeded = durationSeconds;

    // Check credits
    if (user.credits < creditsNeeded) {
      return res.status(402).json({
        error: 'Not enough credits',
        required: creditsNeeded,
        available: user.credits,
      });
    }
    const falResult = await falClient.generate({
      prompt,
      duration: finalDuration,
      forceInstrumental: forceInstrumental || false,
      outputFormat: outputFormat || 'mp3_44100_128',
    });

    if (!falResult.success) {
      return res.status(500).json({ error: falResult.error || 'Error generating music' });
    }

    // Deduct credits
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ credits: user.credits - creditsNeeded })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return res.status(500).json({ error: 'Error updating credits' });
    }

    // Create title from prompt (first 50 chars or "AI Generated Track")
    let trackTitle = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
    if (!trackTitle) {
      trackTitle = 'AI Generated Track';
    }

    // Create track record
    const { data: track, error: trackError } = await supabaseAdmin
      .from('tracks')
      .insert([{
        user_id: userId,
        fal_request_id: falResult.requestId,
        title: trackTitle,
        description: prompt,
        duration: finalDuration,
        status: 'generating',
        credits_used: creditsNeeded
      }])
      .select()
      .single();

    if (trackError) {
      console.error('❌ Error creating track in Supabase:', trackError);
      return res.status(500).json({ error: 'Error creating track' });
    }

    console.log('✅ Track created in Supabase:', {
      trackId: track.id,
      falRequestId: falResult.requestId,
      status: 'generating'
    });

    // Create credit transaction
    const { error: transError } = await supabaseAdmin
      .from('credit_transactions')
      .insert([{
        user_id: userId,
        amount: -creditsNeeded,
        type: 'usage',
        description: `Track generation: ${prompt.substring(0, 50)}...`,
        track_id: track.id
      }]);

    if (transError) {
      console.error('Error creating transaction:', transError);
      // Don't fail the request if transaction logging fails
    }

    res.status(200).json({
      message: 'Generation started',
      trackId: track.id,
      jobId: falResult.requestId,
      estimatedTime: falResult.estimatedTime,
      creditsUsed: creditsNeeded,
      remainingCredits: user.credits - creditsNeeded,
    });
  } catch (error) {
    console.error('Error in generate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
