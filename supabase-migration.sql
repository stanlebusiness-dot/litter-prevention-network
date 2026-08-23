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
  ('Vanessa Manners', 'Founder & President', 'Fundadora y Presidenta',
   'Vanessa founded the Litter Prevention Network to turn her passion for a cleaner community into lasting change. She leads LPN''s programs and community outreach across Willis, TX, guiding the organization''s mission to prevent litter before it starts.',
   'Vanessa fundó la Red de Prevención de Basura para convertir su pasión por una comunidad más limpia en un cambio duradero. Lidera los programas y los esfuerzos de divulgación comunitaria de LPN en todo Willis, TX, guiando la misión de la organización de prevenir la basura antes de que ocurra.',
   1),
  ('Adán Juárez', 'Co-Founder & Vice President', 'Cofundador y Vicepresidente',
   'Adán brings the operational expertise and community relationships that help LPN grow its reach and impact. He champions bilingual outreach to ensure every neighbor — in English and Spanish — can take part in building a litter-free Willis.',
   'Adán aporta la experiencia operativa y las relaciones comunitarias que ayudan a LPN a ampliar su alcance e impacto. Defiende la divulgación bilingüe para garantizar que cada vecino —en inglés y en español— pueda participar en la construcción de un Willis libre de basura.',
   2)
ON CONFLICT DO NOTHING;

-- ============================================================
-- LPN Account Profiles + Child Profiles
-- Run in Supabase SQL Editor.
--
-- Account holder type: every real login account (created via
-- login.html signUp, NOT the "signups" lead-capture table used by the
-- homepage/join forms) must self-identify as an adult or a parent/legal
-- guardian at signup — see login.html's age-gate radio group, which
-- blocks submission entirely for anyone who selects "under 18". Minors
-- never get a standalone account; a parent/guardian adds them as a
-- child profile instead (below).
-- ============================================================

-- 1. profiles — one row per auth.users row, extends it with app fields.
--    Populated automatically by the trigger below at signup time, using
--    the account_type passed in signUp()'s options.data — the client
--    never inserts into this table directly.
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type TEXT        NOT NULL DEFAULT 'adult' CHECK (account_type IN ('adult', 'parent_guardian')),
  is_adult     BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lpn_profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "lpn_profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "lpn_profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create the profile row the moment a new auth user is created, so
-- there's never a window where a logged-in user has no profile row.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, account_type, is_adult)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'adult'),
    COALESCE((NEW.raw_user_meta_data->>'is_adult')::boolean, true)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: give every pre-existing account a default 'adult' profile row
-- so dashboard queries never hit a missing row for older accounts.
INSERT INTO public.profiles (id, account_type, is_adult)
SELECT id, 'adult', true FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. children — profiles OWNED BY a parent/guardian account. These are
--    NOT separate login accounts: no email, no password, no auth.users
--    row at all. Data minimization per COPPA: store only what's needed
--    to display a profile (a name/nickname, optional age or grade).
--    Fully controlled by the parent — add/edit/delete only via RLS
--    policies scoped to parent_user_id = auth.uid().
CREATE TABLE IF NOT EXISTS public.children (
  id                  BIGSERIAL   PRIMARY KEY,
  parent_user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name        TEXT        NOT NULL,  -- first name or nickname only, nothing more identifying
  age_or_grade        TEXT,                   -- optional free text, e.g. "9" or "4th grade"
  -- ── CHILD LOGIN PLACEHOLDER — INTENTIONALLY DISABLED ──────────
  -- This column exists so a future developer has a hook to wire up child
  -- logins without a schema change, but it is not read or set by any
  -- app code today (no UI sets it to true; no login screen checks it).
  -- Do NOT enable child logins until BOTH:
  --   1. There is actual child-facing dashboard content to log in to, and
  --   2. COPPA verifiable-parental-consent has been implemented — turning
  --      this on creates a child-directed account, which is a separate
  --      compliance obligation from the parent/guardian consent above.
  child_login_enabled BOOLEAN     NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lpn_children_select_own" ON public.children FOR SELECT USING (auth.uid() = parent_user_id);
CREATE POLICY "lpn_children_insert_own" ON public.children FOR INSERT WITH CHECK (auth.uid() = parent_user_id);
CREATE POLICY "lpn_children_update_own" ON public.children FOR UPDATE USING (auth.uid() = parent_user_id) WITH CHECK (auth.uid() = parent_user_id);
CREATE POLICY "lpn_children_delete_own" ON public.children FOR DELETE USING (auth.uid() = parent_user_id);

-- ============================================================
-- Close anon read exposure on signups + volunteers
-- Run in Supabase SQL Editor.
--
-- Mapped access pattern (from the actual front-end/Netlify code):
--   signups —
--     anon INSERT:  index.html #signup form, join/index.html form (both
--                    insert into "signups", the lead-capture table — this
--                    is separate from real login accounts, see login.html).
--     anon SELECT:  was `.select('*', {count:'exact', head:true})` for the
--                    public member counter (index.html, join/index.html)
--                    — the ONLY anon read, and it never needed row data,
--                    just a number. Replaced below by get_signup_count().
--     admin read/edit/delete: admin.html's list, edit-modal, and
--                    delete/edit buttons used to run on the anon key
--                    (`_sb.from('signups')...`) gated only by a
--                    client-side password prompt — anyone with the
--                    (public, page-source-visible) anon key could already
--                    read AND rewrite AND delete every member row. Moved
--                    to netlify/functions/admin-table.js (list/get/update/
--                    delete) and the existing delete-member.js (member +
--                    auth-account delete), both service-role and gated by
--                    ADMIN_DELETE_SECRET.
--   volunteers —
--     anon INSERT:  index.html volunteer form.
--     anon SELECT/UPDATE/DELETE: admin.html only, same anon-key pattern
--                    as signups above — same fix, same admin-table.js.
--
-- Net effect: the anon key can add a signup/volunteer row but can no
-- longer read, edit, or delete ANY row in either table (closing both the
-- read leak the user flagged and a write/delete exposure that came with
-- it). service_role (Netlify functions) bypasses RLS entirely as before.
-- ============================================================

ALTER TABLE public.signups    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lpn_signups_anon_insert"    ON public.signups    FOR INSERT WITH CHECK (true);
CREATE POLICY "lpn_volunteers_anon_insert" ON public.volunteers FOR INSERT WITH CHECK (true);
-- Deliberately no SELECT/UPDATE/DELETE policy for anon on either table.

-- Count-only RPC for the public member counter. SECURITY DEFINER runs as
-- the function owner, which (as the table owner) bypasses signups' RLS —
-- but the function only ever returns a count, never row data.
CREATE OR REPLACE FUNCTION public.get_signup_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*) FROM public.signups;
$$;
REVOKE ALL ON FUNCTION public.get_signup_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_signup_count() TO anon, authenticated;
