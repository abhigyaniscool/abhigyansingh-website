import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import DeletePageButton from "@/components/admin/DeletePageButton";
import TogglePublishButton from "@/components/admin/TogglePublishButton";

export const metadata = { title: "Admin — Abhigyan Singh" };

type Row = {
  id: string;
  slug: string;
  title: string;
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
          <h1 className="page-title">Not authorised</h1>
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
    .select("id, slug, title, is_published, sort_order, updated_at")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  const rows = (data ?? []) as Row[];

  return (
    <section className="page-section">
      <div className="container">
        <div className="admin-header">
          <h1 className="page-title" style={{ marginBottom: 0 }}>Admin · Pages</h1>
          <Link href="/admin/pages/new" className="admin-primary-btn">+ New page</Link>
        </div>

        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Pages can be added, edited, hidden, or deleted from here — no code changes required.
          Each page supports Markdown and LaTeX (use <code>$x^2$</code> for inline math
          and <code>$$ ... $$</code> for display equations).
        </p>

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
              {rows.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "1rem", color: "var(--text-muted)" }}>No pages yet.</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/p/${r.slug}`} className="admin-link">{r.title}</Link>
                  </td>
                  <td><code>/p/{r.slug}</code></td>
                  <td>{r.sort_order}</td>
                  <td>
                    <TogglePublishButton id={r.id} isPublished={r.is_published} />
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
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
