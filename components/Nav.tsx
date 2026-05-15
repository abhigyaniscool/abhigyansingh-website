// Server component: builds the nav from the published ROOT pages in the DB,
// so the admin can add or rename top-level tabs without code changes.

import Link from "next/link";
import { listRootPages } from "@/lib/pages";
import AuthBar from "./AuthBar";

export async function Nav() {
  const roots = await listRootPages();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo">
          <span className="logo-prompt">$</span>
          <span className="logo-name">abhigyan_singh</span>
          <span className="logo-cursor" aria-hidden="true">_</span>
        </Link>
        <div className="tabs">
          {roots.map((p) => (
            <Link key={p.id} href={`/p/${p.slug}`} className="tab">
              <span className="tab-bracket">[</span>
              {p.title.toLowerCase()}
              <span className="tab-bracket">]</span>
            </Link>
          ))}
          <AuthBar />
        </div>
      </div>
    </nav>
  );
}
