// Centralised env-var access with helpful errors.
// Setup: see README.md for the four required Vercel environment variables.

export function getSupabaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!v) throw new Error("Missing env var NEXT_PUBLIC_SUPABASE_URL");
  return v;
}

export function getSupabaseAnonKey(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!v) throw new Error("Missing env var NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return v;
}

export function getServiceRoleKey(): string {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!v) throw new Error("Missing env var SUPABASE_SERVICE_ROLE_KEY");
  return v;
}

export function getAdminEmail(): string {
  const v = process.env.ADMIN_EMAIL;
  if (!v) throw new Error("Missing env var ADMIN_EMAIL");
  return v.trim().toLowerCase();
}

// Soft variant — returns null if the env var is missing.
// Useful in components rendered before configuration is complete.
export function getSupabaseUrlOrNull(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
}
