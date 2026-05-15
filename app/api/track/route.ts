// POST /api/track — increment a page's impression counter.
// Called once per session per slug from the TrackPageView client component.

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type ViewRow = Database["public"]["Tables"]["page_views"]["Row"];

const SLUG_RE = /^_?[a-z0-9](?:[a-z0-9\-]{0,78}[a-z0-9])?$/;

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const slug =
    typeof (payload as { slug?: unknown })?.slug === "string"
      ? (payload as { slug: string }).slug.trim().toLowerCase()
      : "";

  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();

    // Read current count, then upsert with +1. Two round-trips, but the
    // increment is small enough that we don't need an RPC for atomicity at
    // this scale; conflicts (rare) just lose at most one count.
    const { data: existing } = await admin
      .from("page_views")
      .select("total_views")
      .eq("slug", slug)
      .maybeSingle();
    const current = (existing as { total_views?: number } | null)?.total_views ?? 0;

    const row: Database["public"]["Tables"]["page_views"]["Insert"] = {
      slug,
      total_views: current + 1,
      last_viewed_at: new Date().toISOString(),
    };
    const { data, error } = await admin
      .from("page_views")
      .upsert(row, { onConflict: "slug" })
      .select("total_views")
      .single();

    if (error) {
      console.error("track upsert error", error.message);
      return NextResponse.json({ error: "Could not record view" }, { status: 500 });
    }
    const updated = data as Pick<ViewRow, "total_views"> | null;
    return NextResponse.json({ ok: true, total_views: updated?.total_views ?? 0 });
  } catch (e) {
    console.error("track route exception", e);
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
}
