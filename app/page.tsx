import Link from "next/link";
import Comments from "@/components/Comments";
import Markdown from "@/components/Markdown";
import Stats from "@/components/Stats";
import ShareLinks from "@/components/ShareLinks";
import TrackPageView from "@/components/TrackPageView";
import { getHomePage, listRootPages, listChildPages, type Page, HOME_SLUG } from "@/lib/pages";
import { getSupabaseUrlOrNull } from "@/lib/supabase/env";
import { getAuthState } from "@/lib/auth";

export default async function HomePage() {
  const [home, roots, auth] = await Promise.all([
    getHomePage(),
    listRootPages(),
    getAuthState(),
  ]);
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
      <TrackPageView slug={HOME_SLUG} />

      <section className="page-section hero">
        <div className="container">
          <div className="hero-prompt">
            <span className="hero-cmd">$ whoami</span>
            {auth.isAdmin && (
              <Link href={`/admin`} className="hero-edit-link">edit home →</Link>
            )}
          </div>

          {home ? (
            <div className="hero-body">
              <Markdown>{home.body}</Markdown>
            </div>
          ) : (
            <div className="card">
              <p style={{ color: "var(--text-muted)" }}>
                The home page hasn&apos;t been set up yet.{" "}
                {configured
                  ? "Log in as the admin and edit the page with slug “_home” at /admin."
                  : "Set up Supabase (see README.md) and re-run the schema."}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <h2 className="home-section-title">$ ls ./sections</h2>

          {roots.length === 0 ? (
            <div className="card">
              <p style={{ color: "var(--text-muted)" }}>
                No sections have been published yet.{" "}
                {auth.isAdmin
                  ? "Use “+ New page” in /admin to create the first one."
                  : "Check back soon."}
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

      <section className="page-section">
        <div className="container">
          <Stats />
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <ShareLinks title="Abhigyan Singh — high-school mathematician" />
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <Comments pageSlug={HOME_SLUG} />
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
