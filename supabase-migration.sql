-- ============================================================
-- LPN Homepage Config Tables
-- Paste into the Supabase SQL Editor and run.
-- ============================================================

-- 1. homepage_config — single-row live config
CREATE TABLE IF NOT EXISTS public.homepage_config (
  id         uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config     jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text        NOT NULL DEFAULT 'admin'
);

-- 2. homepage_config_history — last-N saves for undo
CREATE TABLE IF NOT EXISTS public.homepage_config_history (
  id       uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config   jsonb       NOT NULL DEFAULT '{}'::jsonb,
  saved_at timestamptz NOT NULL DEFAULT now(),
  saved_by text        NOT NULL DEFAULT 'admin'
);

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE public.homepage_config         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_config_history ENABLE ROW LEVEL SECURITY;

-- Public reads (homepage fetches config without auth)
CREATE POLICY "lpn_hpc_public_read"
  ON public.homepage_config FOR SELECT USING (true);

CREATE POLICY "lpn_hpch_public_read"
  ON public.homepage_config_history FOR SELECT USING (true);

-- Anon writes (admin.html uses the anon key — same pattern as site_settings)
CREATE POLICY "lpn_hpc_anon_insert"
  ON public.homepage_config FOR INSERT WITH CHECK (true);

CREATE POLICY "lpn_hpc_anon_update"
  ON public.homepage_config FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "lpn_hpc_anon_delete"
  ON public.homepage_config FOR DELETE USING (true);

CREATE POLICY "lpn_hpch_anon_insert"
  ON public.homepage_config_history FOR INSERT WITH CHECK (true);

CREATE POLICY "lpn_hpch_anon_delete"
  ON public.homepage_config_history FOR DELETE USING (true);

-- ── Realtime ────────────────────────────────────────────────
-- (Run after enabling Realtime on the project in the dashboard
--  under Database → Replication → homepage_config)
ALTER PUBLICATION supabase_realtime ADD TABLE public.homepage_config;

-- ── Default seed ────────────────────────────────────────────
INSERT INTO public.homepage_config (config, updated_by)
VALUES (
  '{"buttons":{"btn1":{"en":"Learn More","es":"Aprender Más","url":"about.html","color":"#0D2B4E","align":"left","vOffset":0},"btn2":{"en":"Sign Up Today!","es":"¡Regístrate Hoy!","url":"#signup","color":"#1A6B2F","align":"left","vOffset":0}},"overlays":[],"sections":{"feature_strip":true,"donate_bar":true,"parallax_1":true,"stats":true,"news_cta":true,"mission":true,"how_it_works":true,"help_section":true,"gallery":true,"parallax_2":true,"parallax_3":true}}',
  'system'
);
