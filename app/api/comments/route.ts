// POST /api/comments — anyone can post a comment.
// We use the SSR client (RLS allows public inserts on the comments table).

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const p = payload as Record<string, unknown>;

  const page_slug = typeof p.page_slug === "string" ? p.page_slug.trim() : "";
  const author_name = typeof p.author_name === "string" ? p.author_name.trim() : "";
  const author_email =
    typeof p.author_email === "string" && p.author_email.trim() ? p.author_email.trim() : null;
  const body = typeof p.body === "string" ? p.body.trim() : "";

  if (!page_slug) return NextResponse.json({ error: "Missing page_slug" }, { status: 400 });
  if (author_name.length < 1 || author_name.length > 80)
    return NextResponse.json({ error: "Name must be 1–80 characters" }, { status: 400 });
  if (body.length < 1 || body.length > 4000)
    return NextResponse.json({ error: "Comment must be 1–4000 characters" }, { status: 400 });

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("comments").insert({
      page_slug,
      author_name,
      author_email,
      body,
    });
    if (error) {
      console.error("comment insert error", error.message);
      return NextResponse.json({ error: "Could not save comment" }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("comment route exception", e);
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
}
