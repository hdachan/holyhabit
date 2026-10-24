"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteInquiry, setInquiryStatus } from "@/app/actions";
import { SITE_NAME } from "@/lib/site";

// 문의함의 버튼들: 답장 쓰기(메일 앱) · 답변 완료 표시 · 삭제
export default function InquiryActions({
  id,
  email,
  type,
  status,
}: {
  id: number;
  email: string;
  type: string;
  status: "new" | "done";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "처리하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  const subject = encodeURIComponent(`[${SITE_NAME}] ${type} 답변드립니다`);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`mailto:${email}?subject=${subject}`}
        className="rounded-lg bg-[#1d1d1f] px-4 py-2 text-[14px] font-medium text-white hover:opacity-90"
      >
        답장 쓰기
      </a>
      <button
        type="button"
        disabled={busy}
        onClick={() => run(() => setInquiryStatus(id, status === "new" ? "done" : "new"))}
        className="rounded-lg border border-black/10 bg-white px-4 py-2 text-[14px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] disabled:opacity-50"
      >
        {status === "new" ? "답변 완료로 표시" : "새 문의로 되돌리기"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (window.confirm("이 문의를 삭제할까요? 되돌릴 수 없어요.")) run(() => deleteInquiry(id));
        }}
        className="rounded-lg px-3 py-2 text-[14px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        삭제
      </button>
    </div>
  );
}
