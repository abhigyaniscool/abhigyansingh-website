"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CommentForm({ pageSlug }: { pageSlug: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_slug: pageSlug,
          author_name: name.trim(),
          author_email: email.trim() || null,
          body: body.trim(),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed (${res.status})`);
      }
      setName("");
      setEmail("");
      setBody("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post comment");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="comment-form" onSubmit={onSubmit}>
      <h3 className="comment-form-title">Leave a comment</h3>
      <div className="comment-form-row">
        <label className="comment-form-label">
          Name
          <input
            type="text"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="comment-form-input"
          />
        </label>
        <label className="comment-form-label">
          Email <span className="comment-form-optional">(optional, never shown)</span>
          <input
            type="email"
            maxLength={120}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="comment-form-input"
          />
        </label>
      </div>
      <label className="comment-form-label">
        Comment
        <textarea
          required
          maxLength={4000}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="comment-form-textarea"
        />
      </label>
      {error && <div className="auth-error">{error}</div>}
      <button type="submit" className="auth-submit" disabled={busy}>
        {busy ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
