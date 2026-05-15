// Browser Supabase client — used by client components for login/signup forms.

"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

let cached: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (cached) return cached;
  cached = createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
  return cached;
}
