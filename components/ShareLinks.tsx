// Share row shown on every page (home + /p/[slug]).
// - LinkedIn: opens the official share dialog in a new tab.
// - Discord:  no public "share to" URL exists, so we copy the title+URL to the
//   clipboard so the user can paste it into any Discord channel.

"use client";

import { useEffect, useState } from "react";

type Props = {
  // The title to prefix in the Discord copy-paste payload. Optional.
  title?: string;
};

export default function ShareLinks({ title }: Props) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState<"discord" | "link" | null>(null);

  useEffect(() => {
    setUrl(window.location.href.split("#")[0]);
  }, []);

  const linkedInUrl = url
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    : "https://www.linkedin.com/";

  async function copyForDiscord() {
    if (!url) return;
    const text = title ? `${title} — ${url}` : url;
    await writeClipboard(text);
    setCopied("discord");
    setTimeout(() => setCopied(null), 2000);
  }

  async function copyPlainLink() {
    if (!url) return;
    await writeClipboard(url);
    setCopied("link");
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <section className="share-links" aria-label="Share this page">
      <span className="share-prompt">$ share</span>

      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-link share-linkedin"
        aria-label="Share on LinkedIn"
      >
        <LinkedInIcon />
        <span>LinkedIn</span>
      </a>

      <button
        type="button"
        className="share-link share-discord"
        onClick={copyForDiscord}
        aria-label="Copy link for Discord"
      >
        <DiscordIcon />
        <span>{copied === "discord" ? "copied ✓" : "Discord"}</span>
      </button>

      <button
        type="button"
        className="share-link share-copy"
        onClick={copyPlainLink}
        aria-label="Copy link"
      >
        <LinkIcon />
        <span>{copied === "link" ? "copied ✓" : "copy link"}</span>
      </button>
    </section>
  );
}

async function writeClipboard(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // fall through to legacy fallback
  }
  // Legacy fallback (older browsers / non-secure contexts)
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  } catch {
    // give up silently — UI will show no confirmation
  }
}

/* ---------- Icons (inline SVG; no extra dependency) ---------- */

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.07 0l3.54-3.54a5 5 0 1 0-7.07-7.07L11.99 4" />
      <path d="M14 11a5 5 0 0 0-7.07 0L3.39 14.54a5 5 0 1 0 7.07 7.07L12.01 20" />
    </svg>
  );
}
