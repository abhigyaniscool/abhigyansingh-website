-- =============================================================================
-- Schema for Abhigyan Singh's mathematician site (DDL only — no seed data)
--
-- This file is 100% IDEMPOTENT and 100% NON-DESTRUCTIVE.
-- Re-running it as many times as you want will:
--   * create missing tables, columns, indexes, triggers, and policies
--   * NEVER insert, update, or delete any row of your data
--
-- For initial default content (the "_home" hero text and the five seed
-- sections), see `supabase/seed.sql`. That file is meant to be run ONCE on
-- a fresh database and protects itself with a sentinel so re-running it
-- does nothing.
-- =============================================================================

-- ---------- pages ----------
create table if not exists public.pages (
    id           uuid primary key default gen_random_uuid(),
    slug         text not null unique,
    title        text not null,
    body         text not null default '',
    parent_slug  text,
    is_published boolean not null default true,
    sort_order   integer not null default 100,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);
alter table public.pages add column if not exists parent_slug text;

create index if not exists pages_parent_idx
    on public.pages (parent_slug);
create index if not exists pages_published_sort_idx
    on public.pages (is_published, sort_order, title);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $fn$
begin
  new.updated_at = now();
  return new;
end $fn$;

drop trigger if exists pages_touch on public.pages;
create trigger pages_touch
  before update on public.pages
  for each row execute function public.touch_updated_at();

-- ---------- comments ----------
create table if not exists public.comments (
    id          uuid primary key default gen_random_uuid(),
    page_slug   text not null,
    author_name text not null,
    author_email text,
    body        text not null,
    created_at  timestamptz not null default now()
);

create index if not exists comments_page_idx
    on public.comments (page_slug, created_at desc);

-- ---------- page_views ----------
create table if not exists public.page_views (
    slug           text primary key,
    total_views    bigint not null default 0,
    last_viewed_at timestamptz not null default now()
);

-- ---------- system_state (used as a sentinel for one-shot seeding) ----------
create table if not exists public.system_state (
    key   text primary key,
    value text not null,
    set_at timestamptz not null default now()
);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.pages         enable row level security;
alter table public.comments      enable row level security;
alter table public.page_views    enable row level security;
alter table public.system_state  enable row level security;

drop policy if exists "pages read published" on public.pages;
create policy "pages read published" on public.pages
    for select using (is_published = true);

drop policy if exists "comments read all" on public.comments;
create policy "comments read all" on public.comments
    for select using (true);

drop policy if exists "comments insert public" on public.comments;
create policy "comments insert public" on public.comments
    for insert with check (
        char_length(author_name) between 1 and 80
        and char_length(body) between 1 and 4000
    );

drop policy if exists "page_views read all" on public.page_views;
create policy "page_views read all" on public.page_views
    for select using (true);

-- system_state is admin-only; no public policies needed (service-role bypasses RLS).
