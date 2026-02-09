import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { hashPassword, generateToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Log incoming request
  console.log('Register attempt:', { email, passwordLength: password?.length });

  // Validate fields
  if (!email || !password) {
    console.log('Validation failed: missing fields');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('Validation failed: invalid email format');
    return res.status(400).json({ error: 'Invalid email' });
  }

  // Validate password length
  if (password.length < 6) {
    console.log('Validation failed: password too short');
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    console.log('Attempting to connect to database...');
    await connectDB();
    console.log('Database connected successfully');

    // Check if email already exists
    console.log('Checking if user exists:', email);
    const existingUser = await User.findOne({ email });
    console.log('Existing user found:', !!existingUser);

    if (existingUser) {
      console.log('Registration failed: user already exists');
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password and create user
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');

    const user = new User({
      email,
      password: hashedPassword,
      credits: 0,
    });

    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully');

    // Generate token
    console.log('Generating token...');
    const token = generateToken(user._id);
    console.log('Token generated successfully');

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error('Error in register:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    res.status(500).json({ error: 'Internal server error' });
  }
}
