"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function DeleteCommentButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="comment-delete"
      disabled={pending}
      onClick={() =>
        start(async () => {
          if (!confirm("Delete this comment?")) return;
          const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
          if (!res.ok) {
            alert("Failed to delete comment");
            return;
          }
          router.refresh();
        })
      }
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
