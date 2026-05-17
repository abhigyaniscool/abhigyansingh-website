-- =============================================================================
-- One-time migration for existing sites (run AFTER pasting the new schema.sql).
--
-- Run this if you have already deployed the site once before today. It does
-- two things:
--   1. Creates the system_state sentinel table if missing (now part of schema.sql,
--      so this is mostly a no-op).
--   2. Stamps the "initial_seed_done" sentinel so seed.sql becomes a no-op
--      forever after — meaning any pages you've deleted from /admin will NOT
--      be re-created if anyone (or you, by habit) re-runs seed.sql.
--
-- It does NOT touch any of your existing rows. Safe to run multiple times.
-- =============================================================================

create table if not exists public.system_state (
    key   text primary key,
    value text not null,
    set_at timestamptz not null default now()
);

insert into public.system_state (key, value)
  values ('initial_seed_done', 'stamped by migrate-existing-to-v3.sql at ' || now()::text)
  on conflict (key) do nothing;
