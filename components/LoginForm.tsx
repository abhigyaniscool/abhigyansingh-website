"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Mode = "login" | "signup";

export default function LoginForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirectTo);
        router.refresh();
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          router.push(redirectTo);
          router.refresh();
        } else {
          setInfo(
            "Account created. Check your inbox for a confirmation email, then return here to log in."
          );
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${mode === "login" ? "active" : ""}`}
          onClick={() => setMode("login")}
        >
          Log in
        </button>
        <button
          type="button"
          className={`auth-tab ${mode === "signup" ? "active" : ""}`}
          onClick={() => setMode("signup")}
        >
          Sign up
        </button>
      </div>

      <label className="auth-label">
        Email
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />
      </label>

      <label className="auth-label">
        Password
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
      </label>

      {error && <div className="auth-error">{error}</div>}
      {info && <div className="auth-info">{info}</div>}

      <button type="submit" className="auth-submit" disabled={busy}>
        {busy ? "Working…" : mode === "login" ? "Log in" : "Create account"}
      </button>

      <p className="auth-hint">
        Only the configured admin account can edit the site. Visitors don&apos;t need an
        account to read or comment.
      </p>
    </form>
  );
}
