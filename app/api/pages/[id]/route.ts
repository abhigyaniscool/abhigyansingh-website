// PATCH/DELETE /api/pages/[id] — admin-only.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type PageUpdate = Database["public"]["Tables"]["pages"]["Update"];

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

  const update: PageUpdate = {};
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

  // parent_slug: explicit null means "make root"; string means "set parent"; absent means "no change"
  if ("parent_slug" in p) {
    const raw = p.parent_slug;
    if (raw === null || raw === "") {
      update.parent_slug = null;
    } else if (typeof raw === "string") {
      const ps = raw.trim().toLowerCase();
      if (!SLUG_RE.test(ps))
        return NextResponse.json({ error: "Invalid parent slug" }, { status: 400 });
      update.parent_slug = ps;
    }
  }

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const admin = createSupabaseAdminClient();

  // Validate parent if we're setting one.
  if (update.parent_slug) {
    const { data: parent } = await admin
      .from("pages")
      .select("slug, parent_slug, id")
      .eq("slug", update.parent_slug)
      .maybeSingle();
    const parentRow = parent as { slug?: string; parent_slug?: string | null; id?: string } | null;
    if (!parentRow?.slug)
      return NextResponse.json({ error: "Parent page not found" }, { status: 400 });
    if (parentRow.parent_slug)
      return NextResponse.json({ error: "Pages can only nest one level deep" }, { status: 400 });
    if (parentRow.id === params.id)
      return NextResponse.json({ error: "A page cannot be its own parent" }, { status: 400 });
  }

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

  // Fetch slug so we can clean up the page's comments and any direct children.
  const { data: pageRow } = await admin
    .from("pages")
    .select("slug")
    .eq("id", params.id)
    .maybeSingle();

  const page = pageRow as { slug?: string } | null;
  if (page?.slug) {
    await admin.from("comments").delete().eq("page_slug", page.slug);
    // Promote any children to root rather than orphan-deleting them.
    await admin.from("pages").update({ parent_slug: null }).eq("parent_slug", page.slug);
  }

  const { error } = await admin.from("pages").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
