"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "About Me" },
  { href: "/research", label: "Research" },
  { href: "/blogs", label: "Blogs" },
  { href: "/programs", label: "Programs" },
  { href: "/interests", label: "Interests" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo">
          Abhigyan Singh
        </Link>
        <div className="tabs">
          {tabs.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`tab ${pathname === href ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
