// Server component: builds the nav from the published pages in the DB,
// so the admin can add or rename pages without code changes.

import Link from "next/link";
import { listPublishedPages } from "@/lib/pages";
import AuthBar from "./AuthBar";

export async function Nav() {
  const pages = await listPublishedPages();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo">
          Abhigyan Singh
        </Link>
        <div className="tabs">
          {pages.map((p) => (
            <Link key={p.id} href={`/p/${p.slug}`} className="tab">
              {p.title}
            </Link>
          ))}
          <AuthBar />
        </div>
      </div>
    </nav>
  );
}
