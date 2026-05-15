// Fires once per browser session per slug to bump the impression counter.
// Runs only after mount, so prefetch / SSR doesn't count as a view.

"use client";

import { useEffect } from "react";

export default function TrackPageView({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return;
    let key: string;
    try {
      key = `tracked:${slug}`;
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage might be disabled (e.g. private mode); record anyway.
    }
    const ctrl = new AbortController();
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
      signal: ctrl.signal,
    }).catch(() => {
      // Best-effort; don't surface tracking failures to the user.
    });
    return () => ctrl.abort();
  }, [slug]);

  return null;
}
