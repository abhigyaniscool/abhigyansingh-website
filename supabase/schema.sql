-- =============================================================================
-- Schema for Abhigyan Singh's mathematician site (v2 — adds page hierarchy)
-- Run this once in the Supabase SQL Editor. Re-running is safe.
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

-- v1 → v2 migration: add parent_slug if upgrading from the first schema.
alter table public.pages add column if not exists parent_slug text;

create index if not exists pages_parent_idx
    on public.pages (parent_slug);

create index if not exists pages_published_sort_idx
    on public.pages (is_published, sort_order, title);

-- keep updated_at fresh
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

-- =============================================================================
-- Row Level Security
-- The Next.js app uses the SERVICE_ROLE key for admin mutations (and for the
-- open comment-insert endpoint), and the ANON key for public reads.
-- =============================================================================
alter table public.pages    enable row level security;
alter table public.comments enable row level security;

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

-- =============================================================================
-- Seed: the original five sections (root pages, no parent_slug).
-- Tagged dollar-quotes ($body$...$body$) so that "$$" inside the bodies (for
-- display math) doesn't terminate the string literal. Safe to re-run.
-- =============================================================================
insert into public.pages (slug, title, body, parent_slug, sort_order, is_published) values
('about', 'About', $body$Hi, I'm **Abhigyan Singh** — a high-school student with a deep passion for **functions, calculus, and discrete mathematics**.

This site is my working notebook: research notes, short blog posts, programs I'm part of, and the questions I keep coming back to. Pages support full **LaTeX**, so when I write a proof I can write it the way I'd write it on paper.

> *"The essence of mathematics lies in its freedom."* — Georg Cantor
$body$, null, 10, true),

('research', 'Research', $body$Notes on what I'm currently thinking about, ongoing problems, and short write-ups.

### Current threads

- **Limits and continuity** — informal notes building intuition for $\varepsilon$-$\delta$ arguments.
- **Discrete structures** — combinatorial identities, generating functions, and counting arguments.
- **Computational experiments** — using code to test conjectures before attempting proofs.

### A favorite identity

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} \;=\; \frac{\pi^2}{6}
$$

Sub-pages (added from the admin) will appear below this body.
$body$, null, 20, true),

('blogs', 'Blogs', $body$Short pieces on mathematical ideas, problem-solving techniques, and things I learned the hard way.
$body$, null, 30, true),

('programs', 'Programs', $body$Programs, competitions, and educational initiatives I've taken part in.
$body$, null, 40, true),

('interests', 'Interests', $body$Beyond core mathematics I'm interested in **artificial intelligence** and **computation** — the places where pure structure meets real systems.
$body$, null, 50, true)
on conflict (slug) do nothing;

-- Backfill: any existing root rows from the v1 schema get parent_slug = NULL
-- (already true by default, but make it explicit so re-running is consistent).
update public.pages set parent_slug = null
  where slug in ('about','research','blogs','programs','interests')
    and parent_slug is not null;
