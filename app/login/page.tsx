import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getAuthState } from "@/lib/auth";

export const metadata = { title: "Log in — Abhigyan Singh" };

export default async function LoginPage() {
  const state = await getAuthState();
  if (state.user) {
    redirect(state.isAdmin ? "/admin" : "/");
  }
  return (
    <section className="page-section">
      <div className="container narrow">
        <h1 className="page-title">Log in</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          The site has a single admin account that can edit pages and remove comments.
          Visitors can read everything and leave comments without an account.
        </p>
        <div className="card">
          <LoginForm redirectTo="/admin" />
        </div>
      </div>
    </section>
  );
}
