"use client";

import { useEffect, useState } from "react";

const tabs = [
  { id: "about", label: "About Me" },
  { id: "research", label: "Research" },
  { id: "blogs", label: "Blogs" },
  { id: "programs", label: "Programs" },
  { id: "interests", label: "Interests" },
];

export function Nav() {
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const handleScroll = () => {
      const sections = tabs.map((tab) => {
        const element = document.getElementById(tab.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          return {
            id: tab.id,
            top: rect.top,
            bottom: rect.bottom,
          };
        }
        return null;
      }).filter(Boolean);

      const scrollPosition = window.scrollY + 150; // Offset for sticky nav

      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollPosition >= sections[i]!.top) {
          setActiveTab(sections[i]!.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const navHeight = 60; // Approximate nav height
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <a
          href="#about"
          onClick={(e) => handleClick(e, "about")}
          className="logo"
        >
          Abhigyan Singh
        </a>
        <div className="tabs">
          {tabs.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => handleClick(e, id)}
              className={`tab ${activeTab === id ? "active" : ""}`}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
