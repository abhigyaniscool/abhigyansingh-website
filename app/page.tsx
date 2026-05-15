import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import Comments from "@/components/Comments";
import { listPublishedPages } from "@/lib/pages";
import { getAuthState } from "@/lib/auth";
import { getSupabaseUrlOrNull } from "@/lib/supabase/env";

export default async function HomePage() {
  const [pages, auth] = await Promise.all([listPublishedPages(), getAuthState()]);
  const configured = !!getSupabaseUrlOrNull();

  return (
    <>
      <section className="page-section">
        <div className="container">
          <h1 className="page-title">Abhigyan Singh</h1>
          <p className="hero-tagline">
            Mathematician — research notes on calculus, discrete mathematics,
            and the structures that quietly run the world.
          </p>

          <div className="card" style={{ marginTop: "1.5rem" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
              Welcome. This is a working notebook of my mathematical life:
              ongoing research, short blog posts, programs I&apos;ve been part of, and the
              questions I keep coming back to. Pick a section from the navigation
              above, or browse the featured pages below.
            </p>
          </div>

          <h2 className="home-section-title">Sections</h2>
          {pages.length === 0 ? (
            <div className="card">
              <p style={{ color: "var(--text-muted)" }}>
                No pages have been published yet.{" "}
                {configured
                  ? "Log in as the admin to create the first one."
                  : "Set up Supabase (see README.md) and the seeded sections will appear here."}
              </p>
            </div>
          ) : (
            <ul className="home-page-list">
              {pages.map((p) => (
                <li key={p.id} className="card home-page-card">
                  <h3>
                    <Link href={`/p/${p.slug}`}>{p.title}</Link>
                  </h3>
                  <p>{firstParagraph(p.body)}</p>
                  <Link href={`/p/${p.slug}`} className="home-page-more">
                    Read &rarr;
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {!auth.user && (
        <section className="page-section" id="login">
          <div className="container narrow">
            <h2 className="home-section-title" style={{ marginTop: 0 }}>
              Admin login
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              Only the configured admin can edit content. Visitors don&apos;t need
              an account to read or comment.
            </p>
            <div className="card">
              <LoginForm redirectTo="/admin" />
            </div>
          </div>
        </section>
      )}

      <section className="page-section">
        <div className="container">
          <Comments pageSlug="home" />
        </div>
      </section>
    </>
  );
}

function firstParagraph(body: string): string {
  const cleaned = body
    .replace(/^#+\s+.*$/gm, "")
    .replace(/[*_>#`]/g, "")
    .trim();
  const para = cleaned.split(/\n\s*\n/)[0] ?? "";
  return para.length > 200 ? para.slice(0, 200).trimEnd() + "…" : para;
}
