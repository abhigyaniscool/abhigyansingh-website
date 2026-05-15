"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Initial = {
  id: string;
  slug: string;
  title: string;
  body: string;
  is_published: boolean;
  sort_order: number;
};

type Props =
  | { mode: "create"; initial?: undefined }
  | { mode: "edit"; initial: Initial };

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
  const [isPublished, setIsPublished] = useState(init?.is_published ?? true);
  const [sortOrder, setSortOrder] = useState(init?.sort_order ?? 100);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touchedSlug, setTouchedSlug] = useState(props.mode === "edit");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        body,
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
        URL slug <span className="comment-form-optional">(visible at /p/&lt;slug&gt;)</span>
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

      <div className="page-editor-row">
        <label className="auth-label">
          Sort order <span className="comment-form-optional">(lower = earlier in nav)</span>
          <input
            className="auth-input"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </label>
        <label className="auth-label" style={{ alignSelf: "flex-end" }}>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          {" "}Published (visible to visitors)
        </label>
      </div>

      <label className="auth-label">
        Body (Markdown + LaTeX)
        <textarea
          className="page-editor-body"
          rows={18}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={"Write in Markdown.\n\nUse $x^2 + y^2 = z^2$ for inline math\n\nor:\n\n$$\n\\int_0^1 x^2\\, dx = \\frac{1}{3}\n$$"}
        />
      </label>

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
