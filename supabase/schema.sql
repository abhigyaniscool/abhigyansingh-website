-- =============================================================================
-- Schema for Abhigyan Singh's mathematician site
-- Run this once in the Supabase SQL Editor (Project → SQL → New Query)
-- =============================================================================

-- ---------- pages ----------
create table if not exists public.pages (
    id           uuid primary key default gen_random_uuid(),
    slug         text not null unique,
    title        text not null,
    body         text not null default '',
    is_published boolean not null default true,
    sort_order   integer not null default 100,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

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
-- The Next.js app uses the SERVICE_ROLE key for admin mutations,
-- and the ANON key for public reads + visitor comment posts.
-- =============================================================================
alter table public.pages    enable row level security;
alter table public.comments enable row level security;

-- pages: anyone can read a published page; only service role can write
drop policy if exists "pages read published" on public.pages;
create policy "pages read published" on public.pages
    for select using (is_published = true);

-- comments: anyone can read; anyone can insert (name + body required); only service role can delete
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
-- Seed: the original five sections, so the site is populated on first load.
-- We use tagged dollar-quotes ($body$...$body$) so that "$$" inside the page
-- bodies (for display math) does not prematurely terminate the string literal.
-- Safe to re-run -- on conflict do nothing.
-- =============================================================================
insert into public.pages (slug, title, body, sort_order, is_published) values
('about', 'About', $body$Hi, I'm **Abhigyan Singh** — a mathematician with a deep passion for **functions, calculus, and discrete mathematics**.

This site is where I share my mathematical explorations, research notes, programs I work on, and the questions that keep me up at night.

Mathematics, for me, is the practice of finding the cleanest possible explanation for why something must be true. The pages here are an attempt to write down what I find along the way — and a place where readers can push back, ask questions, or share their own thinking in the comments.

> *"The essence of mathematics lies in its freedom."*  — Georg Cantor
$body$, 10, true),

('research', 'Research', $body$Notes on what I'm currently thinking about, ongoing problems, and short write-ups.

### Current threads

- **Limits and continuity** — informal notes building intuition for $\varepsilon$-$\delta$ arguments.
- **Discrete structures** — combinatorial identities, generating functions, and counting arguments.
- **Computational experiments** — using code to test conjectures before attempting proofs.

### A favorite identity

The Basel problem famously evaluates the sum of reciprocal squares:

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} \;=\; \frac{\pi^2}{6}.
$$

I plan to add a longer write-up of Euler's original argument here.

*New write-ups will be added from the admin dashboard — no code changes required.*
$body$, 20, true),

('blogs', 'Blogs', $body$Short pieces on mathematical ideas, problem-solving techniques, and things I learned the hard way.

Topics I expect to cover:

- Why the $\binom{n}{k}$ identities are easier than they look.
- A clean derivation of the derivative of $e^x$.
- What "uniform convergence" actually buys you.
- Common pitfalls when using induction.

Posts will appear here as they're written.
$body$, 30, true),

('programs', 'Programs', $body$Programs, competitions, and educational initiatives I've taken part in.

This includes math contests, summer programs, research initiatives, and other settings where I've been lucky enough to learn alongside great people.

Specific entries — with year, role, and a short reflection — will be added here over time.
$body$, 40, true),

('interests', 'Interests', $body$Beyond the core mathematics, I'm interested in how mathematical structure shows up in **artificial intelligence** and **computation**.

A few areas that fascinate me:

- **Linear algebra** as the language of neural networks.
- **Optimization** — why gradient descent works at all, and when it doesn't.
- **Probability** — the bridge between pure mathematics and learning from data.
- **Logic and computability** — the theoretical limits of what machines can decide.

I think the most interesting questions live where pure mathematics, computation, and applied modeling meet.
$body$, 50, true)
on conflict (slug) do nothing;
