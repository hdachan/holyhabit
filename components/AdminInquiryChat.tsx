"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import ChatThread from "@/components/ChatThread";
import { getAdminInquiryMessages, sendAdminInquiryMessage } from "@/app/actions";
import type { ChatMessage } from "@/lib/inquiry";

// 문의함 버그 제보 채팅 화면. 관리자 메시지가 오른쪽, 방문자 메시지가 왼쪽.
export default function AdminInquiryChat({
  id,
  email,
  initialMessages,
  closed,
}: {
  id: number;
  email: string;
  initialMessages: ChatMessage[];
  closed: boolean;
}) {
  const router = useRouter();
  const fetchNew = useCallback((afterId: number) => getAdminInquiryMessages(id, afterId), [id]);
  const send = useCallback((body: string) => sendAdminInquiryMessage(id, body), [id]);
  // 다른 관리자가 삭제한 경우 목록으로 돌아간다.
  const onGone = useCallback(() => router.push("/admin/inquiries"), [router]);

  return (
    <ChatThread
      initialMessages={initialMessages}
      initialClosed={closed}
      closedNotice='해결 완료된 제보예요. 이어서 답하려면 위의 "다시 열기"를 눌러주세요.'
      me="admin"
      partnerName={email}
      fetchNew={fetchNew}
      send={send}
      onGone={onGone}
    />
  );
}
