import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import DeletePageButton from "@/components/admin/DeletePageButton";
import TogglePublishButton from "@/components/admin/TogglePublishButton";
import { isSystemSlug, HOME_SLUG } from "@/lib/pages";

export const metadata = { title: "Admin — Abhigyan Singh" };

type Row = {
  id: string;
  slug: string;
  title: string;
  parent_slug: string | null;
  is_published: boolean;
  sort_order: number;
  updated_at: string;
};

export default async function AdminHome() {
  const state = await getAuthState();
  if (!state.user) redirect("/login");
  if (!state.isAdmin) {
    return (
      <section className="page-section">
        <div className="container narrow">
          <h1 className="page-title">$ permission denied</h1>
          <p style={{ color: "var(--text-muted)" }}>
            You&apos;re logged in, but only the configured admin email can edit content.
          </p>
        </div>
      </section>
    );
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("pages")
    .select("id, slug, title, parent_slug, is_published, sort_order, updated_at")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  const allRows = (data ?? []) as unknown as Row[];

  // Pull system pages (e.g. _home) out for a separate quick-edit row at the top.
  const systemRows = allRows.filter((r) => isSystemSlug(r.slug));
  const homeRow = systemRows.find((r) => r.slug === HOME_SLUG) ?? null;
  const rows = allRows.filter((r) => !isSystemSlug(r.slug));

  // Group: roots first, with their children listed beneath each root.
  const roots = rows.filter((r) => !r.parent_slug);
  const childrenByParent = new Map<string, Row[]>();
  for (const r of rows) {
    if (!r.parent_slug) continue;
    const arr = childrenByParent.get(r.parent_slug) ?? [];
    arr.push(r);
    childrenByParent.set(r.parent_slug, arr);
  }
  // Orphans: a child whose parent was deleted or unpublished
  const knownRoots = new Set(roots.map((r) => r.slug));
  const orphans = rows.filter((r) => r.parent_slug && !knownRoots.has(r.parent_slug));

  type Display = Row & { depth: number };
  const ordered: Display[] = [];
  for (const root of roots) {
    ordered.push({ ...root, depth: 0 });
    const kids = childrenByParent.get(root.slug) ?? [];
    for (const k of kids) ordered.push({ ...k, depth: 1 });
  }
  for (const o of orphans) ordered.push({ ...o, depth: 1 });

  return (
    <section className="page-section">
      <div className="container wide">
        <div className="admin-header">
          <h1 className="page-title" style={{ marginBottom: 0 }}>$ admin · pages</h1>
          <Link href="/admin/pages/new" className="admin-primary-btn">+ New page</Link>
        </div>

        <p className="admin-help">
          Pages can be added, edited, hidden, reordered, or deleted from here — no code changes.
          Each page supports Markdown + LaTeX (`$x^2$` inline, `$$ \int_0^1 x\,dx $$` for display).
          Set a <em>Parent page</em> in the editor to make a page a sub-page; root pages appear as top-tabs.
        </p>

        {homeRow && (
          <div className="admin-system-card">
            <div className="admin-system-card-head">
              <span className="admin-system-tag">SYSTEM</span>
              <span className="admin-system-title">Home page</span>
              <span className="admin-system-slug">slug: <code>{homeRow.slug}</code></span>
            </div>
            <p className="admin-system-desc">
              The body of this page is rendered as the hero on the home screen ({" "}
              <Link href="/" className="admin-link">view</Link>). Slug, hidden state, and
              parent are locked; everything else (including the title and full
              Markdown + LaTeX body) is editable.
            </p>
            <Link href={`/admin/pages/${homeRow.id}/edit`} className="admin-primary-btn">
              edit home page →
            </Link>
          </div>
        )}

        {error && <div className="auth-error">{error.message}</div>}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Order</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ordered.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">No content pages yet.</td></tr>
              )}
              {ordered.map((r) => (
                <tr key={r.id} className={r.depth > 0 ? "admin-row-child" : "admin-row-root"}>
                  <td>
                    <span className="admin-tree-prefix">
                      {r.depth === 0 ? "▸" : "└─"}
                    </span>
                    <Link href={`/p/${r.slug}`} className="admin-link">
                      {r.title}
                    </Link>
                  </td>
                  <td><code>/p/{r.slug}</code></td>
                  <td>{r.sort_order}</td>
                  <td>
                    <TogglePublishButton id={r.id} isPublished={r.is_published} />
                  </td>
                  <td className="admin-cell-date">
                    {new Date(r.updated_at).toLocaleDateString()}
                  </td>
                  <td className="admin-actions">
                    <Link href={`/admin/pages/${r.id}/edit`} className="admin-link">Edit</Link>
                    <DeletePageButton id={r.id} title={r.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
