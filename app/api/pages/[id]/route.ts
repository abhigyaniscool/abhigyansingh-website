// PATCH/DELETE /api/pages/[id] — admin-only.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9\-]{0,78}[a-z0-9])?$/;

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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

  const update: Record<string, unknown> = {};
  if (typeof p.title === "string") update.title = p.title.trim();
  if (typeof p.slug === "string") {
    const slug = p.slug.trim().toLowerCase();
    if (!SLUG_RE.test(slug))
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    update.slug = slug;
  }
  if (typeof p.body === "string") update.body = p.body;
  if (typeof p.is_published === "boolean") update.is_published = p.is_published;
  if (typeof p.sort_order === "number" && Number.isFinite(p.sort_order))
    update.sort_order = Math.trunc(p.sort_order);

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("pages").update(update).eq("id", params.id);
  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();

  // First fetch the slug so we can clean up its comments.
  const { data: pageRow } = await admin
    .from("pages")
    .select("slug")
    .eq("id", params.id)
    .maybeSingle();

  const page = pageRow as { slug?: string } | null;
  if (page?.slug) {
    await admin.from("comments").delete().eq("page_slug", page.slug);
  }

  const { error } = await admin.from("pages").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
