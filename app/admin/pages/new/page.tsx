import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth";
import PageEditor from "@/components/admin/PageEditor";

export const metadata = { title: "New page — Admin" };

export default async function NewPage() {
  const state = await getAuthState();
  if (!state.isAdmin) redirect("/login");

  return (
    <section className="page-section">
      <div className="container">
        <h1 className="page-title">New page</h1>
        <PageEditor mode="create" />
      </div>
    </section>
  );
}
