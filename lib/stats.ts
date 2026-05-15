// Read helpers for the page_views (impression) table.

import { createSupabaseServerClient } from "./supabase/server";
import { listPublishedPages, isSystemSlug, HOME_SLUG } from "./pages";

export type ViewRow = { slug: string; total_views: number; last_viewed_at: string };

export type SiteStats = {
  total: number;
  homeViews: number;
  pageCount: number;
  top: { slug: string; title: string; views: number }[];
  lastViewedAt: string | null;
};

export async function getSiteStats(): Promise<SiteStats> {
  let rows: ViewRow[] = [];
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("page_views")
      .select("slug, total_views, last_viewed_at");
    if (error) {
      console.error("getSiteStats error", error.message);
    } else {
      rows = (data ?? []) as unknown as ViewRow[];
    }
  } catch (e) {
    console.error("getSiteStats exception", e);
  }

  const pages = await listPublishedPages();
  const titleBySlug = new Map(pages.map((p) => [p.slug, p.title]));

  // Total impressions across the entire site
  const total = rows.reduce((sum, r) => sum + Number(r.total_views ?? 0), 0);
  const homeViews = Number(
    rows.find((r) => r.slug === HOME_SLUG)?.total_views ?? 0
  );

  // Top published, non-system pages, sorted by views
  const top = rows
    .filter((r) => !isSystemSlug(r.slug) && titleBySlug.has(r.slug))
    .map((r) => ({
      slug: r.slug,
      title: titleBySlug.get(r.slug) ?? r.slug,
      views: Number(r.total_views ?? 0),
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const lastViewedAt = rows.reduce<string | null>((acc, r) => {
    if (!r.last_viewed_at) return acc;
    if (!acc) return r.last_viewed_at;
    return r.last_viewed_at > acc ? r.last_viewed_at : acc;
  }, null);

  return {
    total,
    homeViews,
    pageCount: pages.filter((p) => !isSystemSlug(p.slug)).length,
    top,
    lastViewedAt,
  };
}
