"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteInquiry, setInquiryStatus } from "@/app/actions";
import { SITE_NAME } from "@/lib/site";
import type { InquiryKind } from "@/lib/inquiry";

// 문의 상세의 버튼들: 이메일로 답장(메일 앱) · 답변 완료/해결 완료 · 삭제
export default function InquiryActions({
  id,
  kind,
  email,
  type,
  status,
}: {
  id: number;
  kind: InquiryKind;
  // 버그 제보는 이메일이 없을 수 있다
  email: string | null;
  type: string;
  status: "new" | "done";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>, after?: () => void) {
    setBusy(true);
    try {
      await action();
      if (after) after();
      else router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "처리하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  const subject = encodeURIComponent(`[${SITE_NAME}] ${type} 답변드립니다`);
  const isBug = kind === "bug";
  const doneLabel = isBug ? "해결 완료" : "답변 완료로 표시";
  const undoLabel = isBug ? "다시 열기" : "새 문의로 되돌리기";
  const listHref = `/super/inquiries${isBug ? "?kind=bug" : ""}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {email && (
        <a
          href={`mailto:${email}?subject=${subject}`}
          className="rounded-lg bg-[#1d1d1f] px-4 py-2 text-[14px] font-medium text-white hover:opacity-90"
        >
          이메일로 답장
        </a>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (
            isBug &&
            status === "new" &&
            !window.confirm("해결 완료로 닫을까요? 방문자는 이 채팅방에 더 이상 메시지를 보낼 수 없어요. (다시 열 수 있어요)")
          )
            return;
          run(() => setInquiryStatus(id, status === "new" ? "done" : "new"));
        }}
        className="rounded-lg border border-black/10 bg-white px-4 py-2 text-[14px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] disabled:opacity-50"
      >
        {status === "new" ? doneLabel : undoLabel}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (window.confirm(`이 ${isBug ? "제보와 대화 내용을" : "문의를"} 모두 삭제할까요? 되돌릴 수 없어요.`))
            run(() => deleteInquiry(id), () => router.push(listHref));
        }}
        className="rounded-lg px-3 py-2 text-[14px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        삭제
      </button>
    </div>
  );
}
