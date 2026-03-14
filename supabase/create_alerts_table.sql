-- Run this SQL in Supabase Dashboard → SQL Editor
-- Creates the alerts table for storing user-posted emergency alerts

CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SOS', 'Medical', 'Blocked Route', 'Resources', 'General')),
  description TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read all alerts
CREATE POLICY "Anyone can read alerts"
  ON public.alerts FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can only insert their own alerts
CREATE POLICY "Users can insert own alerts"
  ON public.alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own alerts
CREATE POLICY "Users can delete own alerts"
  ON public.alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast time-based queries
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts (created_at DESC);
