-- =============================================================================
-- One-shot seed data for Abhigyan Singh's site.
--
-- Run this ONCE in the Supabase SQL Editor on a brand-new database, after
-- you've run schema.sql. It's safe to paste again later — the sentinel below
-- ensures the inserts only fire on the very first run, so any pages you
-- delete from /admin will NEVER be re-created by re-running this file.
--
-- If you actually want to wipe the site and reseed from defaults, run:
--   delete from public.system_state where key = 'initial_seed_done';
--   delete from public.pages;
--   -- then paste this file again.
-- =============================================================================

do $seed$
begin
  -- Sentinel check: bail out if seed has already been applied.
  if exists (select 1 from public.system_state where key = 'initial_seed_done') then
    raise notice 'seed.sql: initial seed already applied; skipping (this is normal).';
    return;
  end if;

  -- ---------- Default home page ----------
  insert into public.pages (slug, title, body, parent_slug, sort_order, is_published)
  values (
    '_home',
    'Home',
    $body$# Abhigyan Singh

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
$body$,
    null, 0, true
  );

  -- ---------- Default sections ----------
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
$body$, null, 50, true);

  -- Mark seed as done so re-runs become no-ops.
  insert into public.system_state (key, value)
    values ('initial_seed_done', now()::text);

  raise notice 'seed.sql: applied initial seed.';
end
$seed$;
