-- Run this SQL in Supabase Dashboard → SQL Editor
-- Creates storage buckets for alert photos and verification documents

-- Create the alert-photos bucket (public, so images can be served)
INSERT INTO storage.buckets (id, name, public)
VALUES ('alert-photos', 'alert-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create the verification-docs bucket (private, only owner + admin can see)
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- ── Alert Photos Policies ──────────────────────────────────────

-- Authenticated users can upload alert photos
CREATE POLICY "Authenticated users can upload alert photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'alert-photos');

-- Anyone can view alert photos (public bucket)
CREATE POLICY "Public read for alert photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'alert-photos');

-- Users can delete their own alert photos
CREATE POLICY "Users can delete own alert photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'alert-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ── Verification Docs Policies ─────────────────────────────────

-- Authenticated users can upload verification docs
CREATE POLICY "Authenticated users can upload verification docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'verification-docs');

-- Users can view their own verification docs
CREATE POLICY "Users can view own verification docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'verification-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
