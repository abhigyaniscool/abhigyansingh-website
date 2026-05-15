# Abhigyan Singh — Personal Website

A mathematician's personal site built with **Next.js 14**, deployed on **Vercel**, and backed by **Supabase** (Postgres + Auth) for content, comments, and admin login.

## Features

- Five seeded sections — About, Research, Blogs, Programs, Interests — all stored in the database and editable through the admin UI.
- Markdown content with **LaTeX/KaTeX** math support (`$x^2$` inline, `$$...$$` display).
- A **comment section on every page** (including the home page). Anyone can post a comment with a name and optional email; the admin can delete comments from the page.
- A built-in **admin dashboard** at `/admin` for creating, editing, hiding, reordering, and deleting pages — **no code changes required to add a new page**.
- Single-admin model: whichever email matches the `ADMIN_EMAIL` env var is the admin. Other accounts can sign in but can't edit content.

---

## One-time setup

### 1. Create a free Supabase project

1. Go to <https://supabase.com> and create a project.
2. In **Project Settings → API**, copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep this **secret** — never expose it to the browser)
3. In **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**. This creates the `pages` and `comments` tables, the row-level-security policies, and seeds the five initial pages.

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
3. Click **+ New page**, fill in the title, slug, and Markdown body, and save.
4. The new page appears in the navigation immediately and is reachable at `/p/<slug>`.

You can hide a page (without deleting it) by toggling its **Published** pill, or reorder the nav by changing the **sort order** field (lower = earlier).

## Writing math

The body of each page is Markdown with the standard GitHub-flavored extensions plus math:

```markdown
The famous Basel sum is $\sum_{n=1}^{\infty} 1/n^2 = \pi^2/6$.

$$
\int_0^\infty e^{-x^2}\, dx = \frac{\sqrt{\pi}}{2}
$$
```

## Moderating comments

Comments are open to anyone (name + optional email + body, validated server-side). When you're logged in as admin, each comment shows a **Delete** button you can use to remove spam.

If you ever want to tighten this (e.g. require approval before a comment shows up publicly), it's a small change in `app/api/comments/route.ts` — add an `approved` column to the `comments` table and filter on it.

---

## Project layout

```
app/
  page.tsx                    Home page (About + featured pages + login + comments)
  login/page.tsx              Login page
  admin/                      Admin dashboard + page editor
  api/comments/               POST a comment, DELETE (admin)
  api/pages/                  Create/update/delete pages (admin)
  p/[slug]/page.tsx           Renders any DB-backed page

components/
  Nav.tsx                     Server-rendered nav (reads pages from DB)
  AuthBar.tsx                 Login/Logout/Admin links
  Comments.tsx                Comment list + form, used on every page
  Markdown.tsx                Markdown + KaTeX renderer
  admin/                      Page editor & admin row buttons

lib/
  supabase/                   SSR + browser + service-role clients
  auth.ts                     getAuthState() + requireAdmin()
  pages.ts                    Public page reads

supabase/
  schema.sql                  Tables, RLS, seed data — run once in Supabase SQL editor
```
