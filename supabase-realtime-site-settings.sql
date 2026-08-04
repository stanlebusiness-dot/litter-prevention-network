-- ============================================================
-- Enable Realtime on site_settings
-- Paste into the Supabase SQL Editor and run.
--
-- site_settings already exists (created ad hoc in the dashboard) and
-- already has permissive anon RLS policies for admin.html's writes — this
-- migration only turns on Realtime replication so INSERT/UPDATE/DELETE on
-- the table push instantly to every page subscribed via .channel(...) in
-- shared.js and index.html (Trash Rangers character art/position, parallax
-- images, grass divider, videos, colors, hero images, announcement bar).
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
