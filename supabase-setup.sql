-- Supabase Database Setup for Sound-Weaver
-- Execute this SQL in the Supabase SQL Editor to create the required tables

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

-- Create policies for users table
-- Allow users to see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Create policies for tracks table
-- Allow users to view their own tracks
CREATE POLICY "Users can view own tracks" ON tracks
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Allow users to insert their own tracks
CREATE POLICY "Users can insert own tracks" ON tracks
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Allow users to update their own tracks
CREATE POLICY "Users can update own tracks" ON tracks
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Allow users to delete their own tracks
CREATE POLICY "Users can delete own tracks" ON tracks
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create policies for credit_transactions table
-- Allow users to view their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Create a function to get current timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
