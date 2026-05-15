"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SplitMarkdownEditor from "./SplitMarkdownEditor";

type Initial = {
  id: string;
  slug: string;
  title: string;
  body: string;
  parent_slug: string | null;
  is_published: boolean;
  sort_order: number;
};

type RootOption = { slug: string; title: string };

type Props =
  | { mode: "create"; initial?: undefined; roots: RootOption[] }
  | { mode: "edit"; initial: Initial; roots: RootOption[] };

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export default function PageEditor(props: Props) {
  const router = useRouter();
  const init = props.mode === "edit" ? props.initial : undefined;

  const [title, setTitle] = useState(init?.title ?? "");
  const [slug, setSlug] = useState(init?.slug ?? "");
  const [body, setBody] = useState(init?.body ?? "");
  const [parentSlug, setParentSlug] = useState<string | null>(init?.parent_slug ?? null);
  const [isPublished, setIsPublished] = useState(init?.is_published ?? true);
  const [sortOrder, setSortOrder] = useState(init?.sort_order ?? 100);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touchedSlug, setTouchedSlug] = useState(props.mode === "edit");

  // When editing a page that itself is a root and has children, prevent
  // turning it into a child (would orphan its children).
  const isRootBeingEdited =
    props.mode === "edit" && !init?.parent_slug;

  // Don't list this page as a possible parent of itself.
  const availableRoots = props.roots.filter((r) => r.slug !== init?.slug);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        body,
        parent_slug: parentSlug,
        is_published: isPublished,
        sort_order: Number(sortOrder),
      };
      const url = props.mode === "create" ? "/api/pages" : `/api/pages/${init!.id}`;
      const method = props.mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed (${res.status})`);
      }
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="page-editor" onSubmit={onSubmit}>
      <div className="page-editor-meta">
        <label className="auth-label">
          Title
          <input
            className="auth-input"
            type="text"
            required
            maxLength={200}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!touchedSlug) setSlug(slugify(e.target.value));
            }}
          />
        </label>

        <label className="auth-label">
          URL slug <span className="comment-form-optional">(/p/&lt;slug&gt;)</span>
          <input
            className="auth-input"
            type="text"
            required
            maxLength={80}
            pattern="[a-z0-9\-]+"
            value={slug}
            onChange={(e) => {
              setTouchedSlug(true);
              setSlug(e.target.value);
            }}
          />
        </label>

        <label className="auth-label">
          Parent page
          <select
            className="auth-input"
            value={parentSlug ?? ""}
            onChange={(e) => setParentSlug(e.target.value || null)}
          >
            <option value="">— Root (top-level tab) —</option>
            {availableRoots.map((r) => (
              <option key={r.slug} value={r.slug}>{r.title}</option>
            ))}
          </select>
          {isRootBeingEdited && (
            <span className="comment-form-optional">
              This page is currently a top-level tab. Moving it under a parent will hide it from the nav.
            </span>
          )}
        </label>

        <label className="auth-label">
          Sort order <span className="comment-form-optional">(lower = earlier)</span>
          <input
            className="auth-input"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </label>

        <label className="auth-label page-editor-checkbox">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Published (visible to visitors)
        </label>
      </div>

      <SplitMarkdownEditor value={body} onChange={setBody} />

      {error && <div className="auth-error">{error}</div>}

      <div className="page-editor-actions">
        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? "Saving…" : props.mode === "create" ? "Create page" : "Save changes"}
        </button>
        <button
          type="button"
          className="admin-secondary-btn"
          onClick={() => router.push("/admin")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
