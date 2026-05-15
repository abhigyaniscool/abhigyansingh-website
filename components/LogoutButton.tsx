"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      className="nav-auth-link nav-auth-button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const supabase = createSupabaseBrowserClient();
          await supabase.auth.signOut();
          router.push("/");
          router.refresh();
        })
      }
    >
      {pending ? "…" : "Log out"}
    </button>
  );
}
