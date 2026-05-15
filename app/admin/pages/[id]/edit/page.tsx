import { notFound, redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import PageEditor from "@/components/admin/PageEditor";

export const metadata = { title: "Edit page — Admin" };

type PageRow = {
  id: string;
  slug: string;
  title: string;
  body: string;
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

  // The supabase-js client returns an untyped record by default; cast to our row type.
  const page = data as unknown as PageRow;

  return (
    <section className="page-section">
      <div className="container">
        <h1 className="page-title">Edit page</h1>
        <PageEditor
          mode="edit"
          initial={{
            id: page.id,
            slug: page.slug,
            title: page.title,
            body: page.body,
            is_published: page.is_published,
            sort_order: page.sort_order,
          }}
        />
      </div>
    </section>
  );
}
