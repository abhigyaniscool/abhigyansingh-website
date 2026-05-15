import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Abhigyan Singh — high-school mathematician",
  description:
    "Notes, proofs, and experiments by Abhigyan Singh — a high-school student in love with calculus, discrete mathematics, and writing things down in LaTeX.",
};

// The Nav and most pages read the Supabase auth cookie. Force dynamic
// rendering so Next.js doesn't try to statically prerender pages that
// require request-time cookies.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Nav />
        <main className="main">{children}</main>
        <footer className="site-footer">
          <div className="container">
            <pre className="footer-block">
{`# made with: next.js · supabase · katex
# powered by: too much chai`}
            </pre>
          </div>
        </footer>
      </body>
    </html>
  );
}
