// Auth helpers — who is logged in, and are they the admin?

import { createSupabaseServerClient } from "./supabase/server";
import { getAdminEmail } from "./supabase/env";

export type AuthState = {
  user: { id: string; email: string | null } | null;
  isAdmin: boolean;
};

export async function getAuthState(): Promise<AuthState> {
  let user: { id: string; email: string | null } | null = null;
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      user = { id: data.user.id, email: data.user.email ?? null };
    }
  } catch {
    // Supabase not configured yet — treat as anonymous so the public site still renders.
    return { user: null, isAdmin: false };
  }

  if (!user) return { user: null, isAdmin: false };

  let adminEmail: string | null = null;
  try {
    adminEmail = getAdminEmail();
  } catch {
    // Not configured yet — treat as no admin.
  }

  const isAdmin =
    !!adminEmail &&
    !!user.email &&
    user.email.trim().toLowerCase() === adminEmail;

  return { user, isAdmin };
}

export async function requireAdmin(): Promise<AuthState> {
  const state = await getAuthState();
  if (!state.isAdmin) {
    const err = new Error("Admin access required");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return state;
}
