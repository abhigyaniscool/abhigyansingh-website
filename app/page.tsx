import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import Comments from "@/components/Comments";
import { listRootPages, listChildPages, type Page } from "@/lib/pages";
import { getAuthState } from "@/lib/auth";
import { getSupabaseUrlOrNull } from "@/lib/supabase/env";

export default async function HomePage() {
  const [roots, auth] = await Promise.all([listRootPages(), getAuthState()]);
  const configured = !!getSupabaseUrlOrNull();

  // Fetch all children of root pages in parallel.
  const childrenByRoot = new Map<string, Page[]>();
  await Promise.all(
    roots.map(async (r) => {
      const kids = await listChildPages(r.slug);
      childrenByRoot.set(r.slug, kids);
    })
  );

  return (
    <>
      <section className="page-section hero">
        <div className="container">
          <div className="hero-prompt">
            <span className="hero-cmd">$ whoami</span>
          </div>
          <h1 className="hero-name">Abhigyan Singh</h1>
          <p className="hero-tagline">
            high-school mathematician · in love with proofs, paradoxes, and
            anything that can be written with a <code>\sum</code>
          </p>
          <pre className="hero-block">
{`> reading       ${"  "}functions · calculus · discrete math
> currently     ${"  "}working through olympiad problem sets
> tools         ${"  "}LaTeX · python · pen and a blank notebook
> latest theorem${"  "}∑ 1/n² = π²/6   (Basel, Euler 1734)`}
          </pre>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <h2 className="home-section-title">$ ls ./sections</h2>

          {roots.length === 0 ? (
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
              {roots.map((p) => {
                const kids = childrenByRoot.get(p.slug) ?? [];
                return (
                  <li key={p.id} className="card home-page-card">
                    <h3>
                      <span className="home-card-prefix">▸</span>
                      <Link href={`/p/${p.slug}`}>{p.title}</Link>
                    </h3>
                    <p>{firstParagraph(p.body)}</p>
                    {kids.length > 0 && (
                      <ul className="home-child-list">
                        {kids.map((k) => (
                          <li key={k.id}>
                            <span className="home-child-prefix">└─</span>
                            <Link href={`/p/${k.slug}`}>{k.title}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link href={`/p/${p.slug}`} className="home-page-more">
                      cd ./{p.slug} &rarr;
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {!auth.user && (
        <section className="page-section" id="login">
          <div className="container narrow">
            <h2 className="home-section-title" style={{ marginTop: 0 }}>
              $ sudo login
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
