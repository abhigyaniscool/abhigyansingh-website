// Browser Supabase client — used by client components for login/signup forms.

"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";
import type { Database } from "./types";

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createSupabaseBrowserClient() {
  if (cached) return cached;
  cached = createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
  return cached;
}
