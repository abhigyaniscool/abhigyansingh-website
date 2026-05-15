import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Markdown from "@/components/Markdown";
import Comments from "@/components/Comments";
import { getPageBySlug } from "@/lib/pages";

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

  return (
    <section className="page-section">
      <div className="container">
        <h1 className="page-title">{page.title}</h1>
        <Markdown>{page.body}</Markdown>
        <Comments pageSlug={page.slug} />
      </div>
    </section>
  );
}
