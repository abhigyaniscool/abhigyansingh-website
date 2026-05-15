import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth";
import PageEditor from "@/components/admin/PageEditor";
import { listRootPages } from "@/lib/pages";

export const metadata = { title: "New page — Admin" };

export default async function NewPage() {
  const state = await getAuthState();
  if (!state.isAdmin) redirect("/login");

  const roots = (await listRootPages()).map((r) => ({ slug: r.slug, title: r.title }));

  return (
    <section className="page-section">
      <div className="container wide">
        <h1 className="page-title">$ new page</h1>
        <PageEditor mode="create" roots={roots} />
      </div>
    </section>
  );
}
