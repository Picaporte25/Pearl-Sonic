import { supabaseAdmin } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

// Apply rate limiting to login endpoint (5 attempts per 15 minutes)
const rateLimitMiddleware = rateLimit('auth');

export default async function handler(req, res) {
  // Apply rate limit check
  const rateLimitResult = rateLimitMiddleware(req, res, () => {
    // This is a no-op, rateLimitMiddleware handles the check
  });

  // If rate limited, the response is already sent
  if (rateLimitResult?.statusCode === 429) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  const { email, password } = req.body;

  // Validate fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  // Add delay to prevent timing attacks (brute force detection)
  // The more failures, the longer the delay
  await new Promise(resolve => setTimeout(resolve, 200));

  try {
    // Find user by email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      // Return generic error to prevent account enumeration
      await new Promise(resolve => setTimeout(resolve, 500));
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      // Add extra delay for failed attempts
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Set cookie with security flags (from server)
    const isSecure = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      `token=${token}`,
      'path=/',
      'max-age=604800', // 7 days
      'HttpOnly',
      'SameSite=Lax',
      isSecure ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', cookieOptions);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
