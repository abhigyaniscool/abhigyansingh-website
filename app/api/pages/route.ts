// POST /api/pages — admin-only: create a new page.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type PageInsert = Database["public"]["Tables"]["pages"]["Insert"];

const SLUG_RE = /^[a-z0-9](?:[a-z0-9\-]{0,78}[a-z0-9])?$/;

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const p = payload as Record<string, unknown>;

  const title = typeof p.title === "string" ? p.title.trim() : "";
  const slug = typeof p.slug === "string" ? p.slug.trim().toLowerCase() : "";
  const body = typeof p.body === "string" ? p.body : "";
  const is_published = p.is_published !== false; // default true
  const sort_order =
    typeof p.sort_order === "number" && Number.isFinite(p.sort_order)
      ? Math.trunc(p.sort_order)
      : 100;

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (!SLUG_RE.test(slug))
    return NextResponse.json(
      { error: "Slug must be lowercase letters, numbers, or hyphens (e.g. my-new-page)" },
      { status: 400 }
    );

  const admin = createSupabaseAdminClient();
  const row: PageInsert = { title, slug, body, is_published, sort_order };
  const { data, error } = await admin
    .from("pages")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "That slug is already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const created = data as { id?: string } | null;
  return NextResponse.json({ ok: true, id: created?.id }, { status: 201 });
}
