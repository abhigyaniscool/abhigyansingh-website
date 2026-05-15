# Abhigyan Singh — Personal Website

A high-school mathematician's personal site. Terminal/hacker aesthetic, Overleaf-style LaTeX editor in admin, hierarchical pages, and a comment section on every page.

Built on **Next.js 14** (App Router), deployed on **Vercel**, backed by **Supabase** (Postgres + Auth) for content, comments, and admin login.

## Features

- **Two-level page hierarchy** — root pages appear as top-tabs in the nav and on the home page; child pages live under their parent, with a breadcrumb back up.
- **Overleaf-style split editor** in admin — source on the left, live KaTeX preview on the right. Toolbar shortcuts for headings, bold/italic, inline math (`$x^2$`), display math (`$$ ... $$`), `aligned` blocks, fractions, lists, code blocks, and links.
- **Markdown + full LaTeX** in every page body. Use `$x^2$` for inline math, `$$ ... $$` for display equations, and `\begin{aligned}...\end{aligned}` inside `$$...$$` for multi-line proofs.
- **Open comments** on every page — anyone can post (name + optional email + body, validated server-side). The admin sees a Delete button on each comment.
- **Admin dashboard at `/admin`** — create, edit, hide, reorder, delete pages. New pages become tabs (root) or sub-pages (with a parent selected), with no code changes.
- **Single-admin model** — whichever email matches the `ADMIN_EMAIL` env var is the admin. Other accounts can sign up but can't edit.

## Look & feel

Dark terminal-inspired theme: near-black background with a faint ASCII grid, JetBrains Mono headings, neon green (`#00ff88`) and cyan (`#66d9ff`) accents, a blinking caret on the logo, and `$` command-prompt prefixes throughout. KaTeX is restyled for dark mode so equations sit naturally on the page.

---

## One-time setup

### 1. Create a free Supabase project

1. Go to <https://supabase.com> and create a project.
2. In **Project Settings → API**, copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep this **secret** — never expose it to the browser)
3. In **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**. This creates the `pages` and `comments` tables, adds the `parent_slug` column for the hierarchy, sets up RLS, and seeds the five initial pages.

> **Already running v1?** The new schema is **idempotent** — re-running it will only `ALTER TABLE ... ADD COLUMN IF NOT EXISTS parent_slug` and leave your existing rows untouched. No data loss.

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (secret) |
| `ADMIN_EMAIL` | The email you'll log in with as admin |

For the deployed site on Vercel, set the same four variables in **Project → Settings → Environment Variables**, then redeploy.

### 3. Create the admin account (one time)

1. `npm run dev` (or visit your deployed site).
2. Click **Log in** and use the **Sign up** tab.
3. Sign up with the email you put in `ADMIN_EMAIL`. Use a strong password.
4. Supabase will email you a confirmation link — click it.
5. Log in. You'll see an **Admin** link in the nav and you'll be redirected to `/admin` after signing in.

If you'd like to skip email confirmation while you're testing, go to Supabase → **Authentication → Providers → Email** and turn off "Confirm email".

---

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Deploy

Push to the connected Git repository — Vercel will build automatically. Make sure the four environment variables above are set in the Vercel project.

---

## Adding pages without code

1. Log in as the admin.
2. Click **Admin** in the nav (or visit `/admin`).
3. Click **+ New page**, fill in the title, slug, body, and (optionally) a **Parent page** to make this a sub-page.
4. The new page appears in the navigation immediately and is reachable at `/p/<slug>`.

You can hide a page (without deleting it) by toggling its **Published** pill, or reorder the nav by changing the **sort order** field (lower = earlier).

When you delete a parent page, its child pages are **promoted to root** rather than deleted.

## Writing math

Pages support full GitHub-flavored Markdown plus KaTeX math:

```markdown
The famous Basel sum is $\sum_{n=1}^{\infty} 1/n^2 = \pi^2/6$.

$$
\int_0^\infty e^{-x^2}\, dx = \frac{\sqrt{\pi}}{2}
$$

$$
\begin{aligned}
  (x + y)^2 &= x^2 + 2xy + y^2 \\
            &= (x - y)^2 + 4xy
\end{aligned}
$$
```

The split editor's toolbar has one-click buttons for the most common patterns (inline math, display math, `aligned`, fractions, headings, code blocks, etc.). Selected text gets wrapped; if nothing is selected, a sensible placeholder is inserted at the cursor.

## Moderating comments

Comments are open to anyone (name + optional email + body, validated server-side). When you're logged in as admin, each comment shows a **Delete** button you can use to remove spam.

---

## Project layout

```
app/
  page.tsx                    Home: hero + sections list (with sub-page links) + login + comments
  login/page.tsx              Login page
  admin/                      Admin dashboard + page editor
  api/comments/               POST a comment, DELETE (admin)
  api/pages/                  Create/update/delete pages (admin); validates parent hierarchy
  p/[slug]/page.tsx           Renders any DB-backed page; lists children if it's a parent

components/
  Nav.tsx                     Server-rendered nav; only shows ROOT pages from DB
  AuthBar.tsx                 Login/Logout/Admin links
  Comments.tsx                Comment list + form, used on every page
  Markdown.tsx                Markdown + KaTeX renderer
  admin/
    PageEditor.tsx            Editor form (title, slug, parent, sort, published)
    SplitMarkdownEditor.tsx   Overleaf-style split-pane editor with live KaTeX preview
    DeletePageButton.tsx
    TogglePublishButton.tsx

lib/
  supabase/                   SSR + browser + service-role clients + Database type
  auth.ts                     getAuthState() + requireAdmin()
  pages.ts                    listPublishedPages / listRootPages / listChildPages / getPageBySlug

supabase/
  schema.sql                  Tables, RLS, seed data — run once in Supabase SQL editor (idempotent)
```
