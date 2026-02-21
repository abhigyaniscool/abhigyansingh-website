# Abhigyan Singh — Personal Website

A personal site with tabs for **About Me**, **Research**, **Blogs**, **Programs**, and **Interests**. Built with Next.js and ready to deploy on Vercel.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel (git push)

1. **Create a GitHub repo** named `abhigyansingh-website` (or use this folder as the repo).
2. **Push this project to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/abhigyansingh-website.git
   git push -u origin main
   ```
3. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in (use “Continue with GitHub”).
   - Click **Add New** → **Project**.
   - Import the `abhigyansingh-website` repo.
   - Leave defaults (Framework: Next.js) and click **Deploy**.
4. **Auto deploy:** Every `git push` to `main` will trigger a new deployment on Vercel.

## Project structure

- `app/` — Next.js App Router pages (About, Research, Blogs, Programs, Interests)
- `components/` — Shared components (e.g. Nav)
- `app/globals.css` — Global styles and tab styling

Edit the content in `app/page.tsx`, `app/research/page.tsx`, etc. to add your own text, links, and projects.
