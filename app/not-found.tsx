import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-section">
      <div className="container narrow">
        <h1 className="page-title">404</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
          That page doesn&apos;t exist (or hasn&apos;t been published).
        </p>
        <p>
          <Link href="/">← Back to the home page</Link>
        </p>
      </div>
    </section>
  );
}
