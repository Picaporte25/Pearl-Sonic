import { supabaseAdmin } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

// Apply rate limiting to register endpoint (5 attempts per 15 minutes)
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

  // Validate password length (min 6, max 128)
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (password.length > 128) {
    return res.status(400).json({ error: 'Password is too long' });
  }

  // Validate email length
  if (email.length > 255) {
    return res.status(400).json({ error: 'Email is too long' });
  }

  // Add delay to prevent spam/abuse
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (checkError) {
      console.error('Supabase error:', checkError);
      if (checkError.message?.includes('JWT') || checkError.message?.includes('API')) {
        return res.status(500).json({ error: 'Database configuration error' });
      }
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);

    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([{
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        credits: 0
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting user:', insertError);
      if (insertError.message?.includes('JWT') || insertError.message?.includes('API')) {
        return res.status(500).json({ error: 'Database configuration error' });
      }
      return res.status(500).json({ error: 'Error creating user' });
    }

    // Generate token
    const token = generateToken(newUser.id);

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

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        credits: newUser.credits,
      },
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
