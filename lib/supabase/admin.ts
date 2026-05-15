// Service-role Supabase client. Bypasses RLS — only use on the server,
// inside route handlers that have already verified the caller is admin.

import { createClient } from "@supabase/supabase-js";
import { getServiceRoleKey, getSupabaseUrl } from "./env";

let cached: ReturnType<typeof createClient> | null = null;

export function createSupabaseAdminClient() {
  if (cached) return cached;
  cached = createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
