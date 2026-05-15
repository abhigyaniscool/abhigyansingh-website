import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Markdown from "@/components/Markdown";
import Comments from "@/components/Comments";
import TrackPageView from "@/components/TrackPageView";
import { getPageBySlug, listChildPages, isSystemSlug } from "@/lib/pages";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);
  if (!page) return { title: "Not found" };
  return {
    title: `${page.title} — Abhigyan Singh`,
    description: page.body.slice(0, 160).replace(/\s+/g, " "),
  };
}

export default async function DynamicPage({ params }: Props) {
  const page = await getPageBySlug(params.slug);
  if (!page) notFound();

  // Don't expose system pages (like _home) at /p/<slug>; they're rendered
  // in their dedicated location and shouldn't be reachable via the dynamic route.
  if (isSystemSlug(page.slug)) notFound();

  const isRoot = !page.parent_slug;
  const children = isRoot ? await listChildPages(page.slug) : [];

  // Breadcrumb if this is a child page
  let parentTitle: string | null = null;
  if (page.parent_slug) {
    const parent = await getPageBySlug(page.parent_slug);
    parentTitle = parent?.title ?? page.parent_slug;
  }

  return (
    <section className="page-section">
      <TrackPageView slug={page.slug} />
      <div className="container">
        {parentTitle && page.parent_slug && (
          <nav className="breadcrumb">
            <span className="breadcrumb-prompt">$</span>{" "}
            <Link href="/">~</Link>
            <span className="breadcrumb-sep">/</span>
            <Link href={`/p/${page.parent_slug}`}>{parentTitle.toLowerCase()}</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{page.title.toLowerCase()}</span>
          </nav>
        )}

        <h1 className="page-title">{page.title}</h1>

        <Markdown>{page.body}</Markdown>

        {isRoot && children.length > 0 && (
          <section className="children-section">
            <h2 className="home-section-title">$ ls ./{page.slug}</h2>
            <ul className="home-page-list">
              {children.map((c) => (
                <li key={c.id} className="card home-page-card">
                  <h3>
                    <span className="home-card-prefix">└─</span>
                    <Link href={`/p/${c.slug}`}>{c.title}</Link>
                  </h3>
                  <p>{firstParagraph(c.body)}</p>
                  <Link href={`/p/${c.slug}`} className="home-page-more">
                    cd ./{c.slug} &rarr;
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Comments pageSlug={page.slug} />
      </div>
    </section>
  );
}

function firstParagraph(body: string): string {
  const cleaned = body
    .replace(/^#+\s+.*$/gm, "")
    .replace(/[*_>#`]/g, "")
    .trim();
  const para = cleaned.split(/\n\s*\n/)[0] ?? "";
  return para.length > 180 ? para.slice(0, 180).trimEnd() + "…" : para;
}
