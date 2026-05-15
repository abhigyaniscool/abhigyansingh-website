-- =============================================================================
-- Schema for Abhigyan Singh's mathematician site (v3)
--   v1: pages + comments
--   v2: + parent_slug for two-level page hierarchy
--   v3: + page_views (impression counter) + admin-editable home page
-- Re-running this file is safe (all DDL is idempotent).
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

-- ---------- page_views (impression counter) ----------
create table if not exists public.page_views (
    slug           text primary key,
    total_views    bigint not null default 0,
    last_viewed_at timestamptz not null default now()
);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.pages       enable row level security;
alter table public.comments    enable row level security;
alter table public.page_views  enable row level security;

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

-- view counts are publicly readable; writes go through the service-role key.
drop policy if exists "page_views read all" on public.page_views;
create policy "page_views read all" on public.page_views
    for select using (true);

-- =============================================================================
-- Seed: special _home page (admin-editable home content) + the 5 sections.
-- The leading underscore in the slug marks it as system-special; the app
-- filters it out of the nav/sections so it never appears as a tab.
-- =============================================================================
insert into public.pages (slug, title, body, parent_slug, sort_order, is_published) values
('_home', 'Home', $body$# Abhigyan Singh

> high-school mathematician · in love with proofs, paradoxes, and anything that can be written with a `\sum`

```
> reading         functions · calculus · discrete math
> currently       working through olympiad problem sets
> tools           LaTeX · python · pen and a blank notebook
> latest theorem  ∑ 1/n² = π²/6   (Basel, Euler 1734)
```

Welcome. This site is my working notebook: research notes, blog posts, programs I'm part of, and the questions I keep coming back to. Every page supports full **LaTeX**, so when I write a proof I can write it the way I'd write it on paper.

$$
e^{i\pi} + 1 = 0
$$

Pick a section below to dive in.
$body$, null, 0, true),
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

-- Make sure the 5 original root rows have parent_slug = NULL
update public.pages set parent_slug = null
  where slug in ('about','research','blogs','programs','interests','_home')
    and parent_slug is not null;
