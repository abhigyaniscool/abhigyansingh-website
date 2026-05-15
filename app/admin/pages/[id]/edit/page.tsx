import { notFound, redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import PageEditor from "@/components/admin/PageEditor";
import { listRootPages } from "@/lib/pages";

export const metadata = { title: "Edit page — Admin" };

type PageRow = {
  id: string;
  slug: string;
  title: string;
  body: string;
  parent_slug: string | null;
  is_published: boolean;
  sort_order: number;
};

export default async function EditPage({ params }: { params: { id: string } }) {
  const state = await getAuthState();
  if (!state.isAdmin) redirect("/login");

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("pages")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) notFound();
  const page = data as unknown as PageRow;

  const roots = (await listRootPages()).map((r) => ({ slug: r.slug, title: r.title }));

  return (
    <section className="page-section">
      <div className="container wide">
        <h1 className="page-title">$ edit · {page.title}</h1>
        <PageEditor
          mode="edit"
          roots={roots}
          initial={{
            id: page.id,
            slug: page.slug,
            title: page.title,
            body: page.body,
            parent_slug: page.parent_slug,
            is_published: page.is_published,
            sort_order: page.sort_order,
          }}
        />
      </div>
    </section>
  );
}
