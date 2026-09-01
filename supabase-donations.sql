-- Donation records written server-to-server by netlify/functions/stripe-webhook.js
-- when a Stripe Checkout session completes. No client ever writes here.
CREATE TABLE IF NOT EXISTS public.donations (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id      text UNIQUE NOT NULL,
  stripe_payment_intent  text,
  amount_cents           integer NOT NULL,
  currency               text NOT NULL DEFAULT 'usd',
  donor_email            text,
  donor_name             text,
  frequency              text NOT NULL DEFAULT 'one-time',
  status                 text NOT NULL,
  created_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- No policies are created on purpose: with RLS enabled and zero policies,
-- anon and authenticated roles get zero access (no SELECT/INSERT/UPDATE/
-- DELETE). Only the service-role key — used server-side in
-- netlify/functions/stripe-webhook.js, and any future admin read
-- function modeled on admin-table.js — bypasses RLS entirely, so donor
-- emails, names, and amounts never reach the browser.
