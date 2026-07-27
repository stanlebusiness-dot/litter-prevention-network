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
  '{"buttons":{"btn1":{"en":"Learn More","es":"Aprender Más","url":"about.html","color":"#0D2B4E","align":"left","vOffset":0},"btn2":{"en":"Free Sign Up","es":"Registro Gratis","url":"#signup","color":"#1A6B2F","align":"left","vOffset":0}},"joinUs":{"en":"Join Us","es":"Únete","url":"volunteer.html","visible":true,"heroVisible":true},"overlays":[],"sections":{"feature_strip":true,"donate_bar":true,"parallax_1":true,"stats":true,"news_cta":true,"mission":true,"how_it_works":true,"help_section":true,"gallery":true,"parallax_2":true,"parallax_3":true}}',
  'system'
);

-- ============================================================
-- LPN Leadership Table
-- Run in Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.leadership (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  title_en   TEXT        NOT NULL DEFAULT '',
  title_es   TEXT        NOT NULL DEFAULT '',
  bio_en     TEXT        NOT NULL DEFAULT '',
  bio_es     TEXT        NOT NULL DEFAULT '',
  photo_url  TEXT,
  sort_order INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lpn_leadership_read"   ON public.leadership FOR SELECT USING (true);
CREATE POLICY "lpn_leadership_insert" ON public.leadership FOR INSERT WITH CHECK (true);
CREATE POLICY "lpn_leadership_update" ON public.leadership FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "lpn_leadership_delete" ON public.leadership FOR DELETE USING (true);

-- Storage RLS for leadership photos
CREATE POLICY "lpn_ls_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-images' AND name LIKE 'leadership/%');
CREATE POLICY "lpn_ls_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-images' AND name LIKE 'leadership/%');
CREATE POLICY "lpn_ls_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'site-images' AND name LIKE 'leadership/%');

-- Seed: founding leadership
INSERT INTO public.leadership (name, title_en, title_es, bio_en, bio_es, sort_order)
VALUES
  ('Vanessa Manners', 'President', 'Presidenta',
   'Vanessa co-founded the Litter Prevention Network to turn her passion for a cleaner community into lasting change. She leads LPN''s programs and community outreach efforts in Willis, TX.',
   'Vanessa cofundó la Red de Prevención de Basura para convertir su pasión por una comunidad más limpia en un cambio duradero. Lidera los programas y los esfuerzos de divulgación comunitaria de LPN en Willis, TX.',
   1),
  ('Adán Juárez', 'Vice President', 'Vicepresidente',
   'Adán brings operational expertise and community relationships that help LPN grow its reach and impact. He champions bilingual outreach to ensure every neighbor can participate in building a litter-free Willis.',
   'Adán aporta experiencia operativa y relaciones comunitarias que ayudan a LPN a ampliar su alcance e impacto. Defiende la divulgación bilingüe para garantizar que cada vecino pueda participar en la construcción de un Willis libre de basura.',
   2)
ON CONFLICT DO NOTHING;
