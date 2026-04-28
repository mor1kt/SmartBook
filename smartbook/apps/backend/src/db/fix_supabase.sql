-- Run this in Supabase SQL editor to fix common issues for the backend:
-- 1) missing columns expected by the API
-- 2) missing privileges for role `service_role`

-- centers.schedule_settings is used by the backend (optional fallback exists),
-- but older schemas may not have it.
ALTER TABLE IF EXISTS public.centers
ADD COLUMN IF NOT EXISTS schedule_settings JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Ensure service role can read/write application tables.
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO service_role;

