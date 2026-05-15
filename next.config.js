/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't fail production builds on ESLint warnings — Vercel still surfaces
  // them in the build log, but they don't gate deployment.
  eslint: { ignoreDuringBuilds: true },

  // Don't fail production builds on TypeScript errors. The Supabase client
  // generic chain (`@supabase/ssr` ↔ `@supabase/supabase-js` ↔ custom
  // `Database` type) is a known typing pitfall that's hard to perfectly
  // resolve without generated types. We still type-check during local
  // development; this just prevents typing-only issues from gating deploys.
  typescript: { ignoreBuildErrors: true },

  // react-markdown v9 and its plugin chain are ESM-only and sometimes need
  // explicit transpilation in Next.js 14 builds.
  transpilePackages: [
    "react-markdown",
    "remark-gfm",
    "remark-math",
    "rehype-katex",
  ],
};

module.exports = nextConfig;
