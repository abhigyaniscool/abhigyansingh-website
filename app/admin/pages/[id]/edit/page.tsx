import { notFound, redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import PageEditor from "@/components/admin/PageEditor";

export const metadata = { title: "Edit page — Admin" };

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

  return (
    <section className="page-section">
      <div className="container">
        <h1 className="page-title">Edit page</h1>
        <PageEditor
          mode="edit"
          initial={{
            id: data.id as string,
            slug: data.slug as string,
            title: data.title as string,
            body: data.body as string,
            is_published: data.is_published as boolean,
            sort_order: data.sort_order as number,
          }}
        />
      </div>
    </section>
  );
}
