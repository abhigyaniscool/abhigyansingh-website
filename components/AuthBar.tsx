// Server component rendered inside the nav.
// Shows nothing (or a quiet "Log in" link) for visitors,
// and Admin / Logout links for the admin account.

import Link from "next/link";
import { getAuthState } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function AuthBar() {
  let state;
  try {
    state = await getAuthState();
  } catch {
    return null;
  }

  if (!state.user) {
    return (
      <Link href="/login" className="nav-auth-link">
        Log in
      </Link>
    );
  }

  return (
    <div className="nav-auth">
      {state.isAdmin && (
        <Link href="/admin" className="nav-auth-link">
          Admin
        </Link>
      )}
      <LogoutButton />
    </div>
  );
}
