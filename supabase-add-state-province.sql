-- Adds state/province tracking to signups. Nullable with no default —
-- the 37 existing rows have no value and must keep loading/exporting fine.
-- Free-text (see index.html/join/index.html + shared.js's
-- LPN_STATE_PROVINCE_OPTIONS datalist for why: LPN's membership spans the
-- US, Mexico, and Latin America, so a fixed dropdown can't cover every
-- region — the datalist nudges toward consistent spelling for the two most
-- common regions (US states, Mexican states) without blocking anything else.
ALTER TABLE public.signups ADD COLUMN IF NOT EXISTS state_province text;
