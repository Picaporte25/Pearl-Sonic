-- Supabase Database Setup for Sound-Weaver (SAFE VERSION)
-- This version won't fail if types/tables already exist

-- Drop everything first (clean slate)
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS tracks CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS track_status;
DROP TYPE IF EXISTS transaction_type;

-- Create enum types
CREATE TYPE track_status AS ENUM ('generating', 'completed', 'failed');
CREATE TYPE transaction_type AS ENUM ('purchase', 'usage', 'refund');

-- Create table users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table tracks
CREATE TABLE tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suno_id TEXT,
  title TEXT DEFAULT 'Untitled',
  description TEXT,
  genre TEXT,
  mood TEXT,
  duration INTEGER,
  status track_status DEFAULT 'generating',
  audio_url TEXT,
  cover_url TEXT,
  credits_used INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table credit_transactions
CREATE TABLE credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type transaction_type NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_tracks_created_at ON tracks(created_at DESC);
CREATE INDEX idx_tracks_user_created ON tracks(user_id, created_at DESC);
CREATE INDEX idx_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_transactions_user_created ON credit_transactions(user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can view own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can insert own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can update own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can delete own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;

-- Create policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Create policies for tracks table
CREATE POLICY "Users can view own tracks" ON tracks
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own tracks" ON tracks
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own tracks" ON tracks
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own tracks" ON tracks
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create policies for credit_transactions table
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);
