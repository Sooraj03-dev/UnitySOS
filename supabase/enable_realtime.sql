-- Run this SQL in Supabase Dashboard → SQL Editor (one-time)
-- Enables Realtime on the alerts table so postgres_changes events fire

-- Add the alerts table to the Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
