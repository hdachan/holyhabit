"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/app/actions";

export default function DeletePostButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const ok = window.confirm(`"${title}" 글을 삭제할까요? 되돌릴 수 없어요.`);
    if (!ok) return;

    setDeleting(true);
    try {
      await deletePost(slug);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했어요.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-[14px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {deleting ? "삭제 중..." : "삭제"}
    </button>
  );
}