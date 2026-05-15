"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function TogglePublishButton({
  id,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={`admin-pill ${isPublished ? "admin-pill-on" : "admin-pill-off"}`}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await fetch(`/api/pages/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_published: !isPublished }),
          });
          if (!res.ok) {
            alert("Could not change visibility");
            return;
          }
          router.refresh();
        })
      }
    >
      {pending ? "…" : isPublished ? "Published" : "Hidden"}
    </button>
  );
}
