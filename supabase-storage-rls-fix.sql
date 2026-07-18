-- ============================================================
-- LPN Storage RLS Fix
-- Run this in: Supabase Dashboard → SQL Editor → New query
--
-- Problem: the original migration only created storage policies
-- for leadership/* — uploads to logo/, characters/, overlays/,
-- before-after/, and trash-rangers/ were silently blocked.
--
-- This script replaces all storage.objects policies for the
-- site-images bucket with one broad policy per operation,
-- so every folder the admin uses actually works.
-- ============================================================

-- ── 1. Drop old path-specific policies (avoids name conflicts) ──
DROP POLICY IF EXISTS "lpn_ls_insert" ON storage.objects;
DROP POLICY IF EXISTS "lpn_ls_update" ON storage.objects;
DROP POLICY IF EXISTS "lpn_ls_delete" ON storage.objects;
DROP POLICY IF EXISTS "lpn_ls_select" ON storage.objects;

-- Drop any other variants that may exist under different names
DROP POLICY IF EXISTS "site_images_select" ON storage.objects;
DROP POLICY IF EXISTS "site_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "site_images_update" ON storage.objects;
DROP POLICY IF EXISTS "site_images_delete" ON storage.objects;

-- ── 2. Public read — anyone can view uploaded assets ──
CREATE POLICY "site_images_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-images');

-- ── 3. Anon upload — admin (uses anon key) can upload to any folder ──
CREATE POLICY "site_images_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-images');

-- ── 4. Anon replace — upload(..., { upsert: true }) needs UPDATE ──
CREATE POLICY "site_images_update"
  ON storage.objects FOR UPDATE
  USING  (bucket_id = 'site-images')
  WITH CHECK (bucket_id = 'site-images');

-- ── 5. Anon delete — admin can remove old files ──
CREATE POLICY "site_images_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-images');


-- ============================================================
-- ALSO: make sure the bucket itself is set to public so that
-- getPublicUrl() returns accessible URLs.
-- If the bucket was created as private, run this too:
-- ============================================================
UPDATE storage.buckets
  SET public = true
  WHERE id = 'site-images';


-- ============================================================
-- Verify: you should see 4 rows — select, insert, update, delete
-- ============================================================
SELECT policyname, cmd
  FROM pg_policies
  WHERE tablename = 'objects'
    AND schemaname = 'storage'
  ORDER BY policyname;
