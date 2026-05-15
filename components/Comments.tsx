// Server component: lists comments for a page and renders the post form below.
// The form is a client component.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthState } from "@/lib/auth";
import CommentForm from "./CommentForm";
import DeleteCommentButton from "./DeleteCommentButton";

type Comment = {
  id: string;
  page_slug: string;
  author_name: string;
  body: string;
  created_at: string;
};

async function fetchComments(pageSlug: string): Promise<Comment[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("comments")
      .select("id, page_slug, author_name, body, created_at")
      .eq("page_slug", pageSlug)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("fetchComments error", error.message);
      return [];
    }
    return (data ?? []) as Comment[];
  } catch (e) {
    console.error("fetchComments exception", e);
    return [];
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function Comments({ pageSlug }: { pageSlug: string }) {
  const [comments, auth] = await Promise.all([fetchComments(pageSlug), getAuthState()]);

  return (
    <section className="comments">
      <h2 className="comments-title">Comments</h2>

      {comments.length === 0 ? (
        <p className="comments-empty">No comments yet — be the first to write one.</p>
      ) : (
        <ul className="comments-list">
          {comments.map((c) => (
            <li key={c.id} className="comment">
              <div className="comment-meta">
                <span className="comment-author">{c.author_name}</span>
                <span className="comment-date">{formatDate(c.created_at)}</span>
                {auth.isAdmin && <DeleteCommentButton id={c.id} />}
              </div>
              <p className="comment-body">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <CommentForm pageSlug={pageSlug} />
    </section>
  );
}
