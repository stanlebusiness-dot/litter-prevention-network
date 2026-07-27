-- ============================================================
-- LPN Sign-up Source Tracking
-- Run in: Supabase Dashboard → SQL Editor → New query
--
-- Problem: index.html and join/index.html already send a
-- `signup_source` field on every insert (values: 'main' or
-- 'event'), but the `signups` table has no such column, so the
-- client-side fallback silently drops it on every insert. Sign-ups
-- from the event/booth QR are currently indistinguishable from
-- main-site sign-ups.
--
-- This adds the column so the value actually persists. No RLS
-- changes needed — the existing anon insert policy on `signups`
-- already covers whatever columns are present in the row.
-- ============================================================

ALTER TABLE public.signups
  ADD COLUMN IF NOT EXISTS signup_source text NOT NULL DEFAULT 'main';

-- ============================================================
-- Verify: column should show up with default 'main'
-- ============================================================
SELECT column_name, data_type, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'signups'
  ORDER BY ordinal_position;
