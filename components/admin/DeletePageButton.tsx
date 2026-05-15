"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function DeletePageButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="admin-danger-btn"
      disabled={pending}
      onClick={() =>
        start(async () => {
          if (!confirm(`Delete page "${title}"? This also removes its comments.`)) return;
          const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
          if (!res.ok) {
            alert("Failed to delete");
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
