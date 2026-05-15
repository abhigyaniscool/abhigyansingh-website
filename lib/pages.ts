// Data access for the `pages` table.
// Reads use the SSR client (RLS limits to is_published = true for visitors).
// Admin writes are done in route handlers using the service-role client.

import { createSupabaseServerClient } from "./supabase/server";

export type Page = {
  id: string;
  slug: string;
  title: string;
  body: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export async function listPublishedPages(): Promise<Page[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });
    if (error) {
      console.error("listPublishedPages error", error.message);
      return [];
    }
    return (data ?? []) as Page[];
  } catch (e) {
    console.error("listPublishedPages exception", e);
    return [];
  }
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) {
      console.error("getPageBySlug error", error.message);
      return null;
    }
    return (data ?? null) as Page | null;
  } catch (e) {
    console.error("getPageBySlug exception", e);
    return null;
  }
}
