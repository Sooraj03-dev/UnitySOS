-- Run this SQL in Supabase Dashboard → SQL Editor
-- Creates the verification_docs table for tracking document verification submissions

CREATE TABLE IF NOT EXISTS public.verification_docs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.verification_docs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own verification docs
CREATE POLICY "Users can read own verification docs"
  ON public.verification_docs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own verification docs
CREATE POLICY "Users can insert own verification docs"
  ON public.verification_docs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own pending verification docs
CREATE POLICY "Users can delete own pending docs"
  ON public.verification_docs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- Index for fast user-scoped queries
CREATE INDEX IF NOT EXISTS idx_verification_docs_user_id ON public.verification_docs (user_id);
