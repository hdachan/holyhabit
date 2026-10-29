import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import AdminInquiryChat from "@/components/AdminInquiryChat";
import InquiryActions from "@/components/InquiryActions";
import type { ChatMessage, InquiryKind } from "@/lib/inquiry";

type PageProps = {
  params: Promise<{ id: string }>;
};

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// 문의함 상세. 문의는 내용을 보고 이메일로 답장하고, 버그 제보는 채팅으로 주고받는다.
export default async function AdminInquiryPage({ params }: PageProps) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const supabase = createSupabaseAdminClient();
  const { data: inquiry } = await supabase
    .from("inquiries")
    .select("id, kind, type, email, content, status, source, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!inquiry) notFound();

  const kind: InquiryKind = inquiry.kind === "bug" ? "bug" : "inquiry";
  const isBug = kind === "bug";
  const done = inquiry.status === "done";
  const statusLabel = isBug ? (done ? "해결 완료" : "진행 중") : done ? "답변 완료" : "새 문의";

  let messages: ChatMessage[] = [];
  if (isBug) {
    const { data: rows, error } = await supabase
      .from("inquiry_messages")
      .select("id, sender, body, created_at")
      .eq("inquiry_id", id)
      .order("id");
    if (error) throw new Error(error.message);
    messages = (rows ?? []).map((row) => ({
      id: row.id,
      sender: row.sender === "admin" ? "admin" : "user",
      body: row.body,
      createdAt: row.created_at,
    }));
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto max-w-[860px] px-6 py-16">
        <Link
          href={`/admin/inquiries${isBug ? "?kind=bug" : ""}`}
          className="text-[14px] text-[#6e6e73] hover:text-[#1d1d1f]"
        >
          ← {isBug ? "버그 제보" : "문의"} 목록
        </Link>
        <p className="mt-4 text-[13px] font-medium text-[#6e6e73]">
          {inquiry.type} · {dateTimeFormatter.format(new Date(inquiry.created_at))} 접수
          {inquiry.source !== "web" && ` · ${inquiry.source}`}
        </p>
        <h1 className="mt-1 mb-4 flex flex-wrap items-center gap-2 text-[22px] font-bold text-[#1d1d1f]">
          {inquiry.email ?? "이메일 없음"}
          <span
            className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${
              done ? "bg-[#e9ebee] text-[#6e6e73]" : "bg-[#e8f3ff] text-[#1b64da]"
            }`}
          >
            {statusLabel}
          </span>
        </h1>

        <div className="mb-4">
          <InquiryActions
            id={inquiry.id}
            kind={kind}
            email={inquiry.email}
            type={inquiry.type}
            status={done ? "done" : "new"}
          />
        </div>

        {isBug ? (
          <>
            {/* 해결 완료·다시 열기를 누르면 화면을 새로 받아 채팅을 그 상태로 다시 그린다 */}
            <AdminInquiryChat
              key={inquiry.status}
              id={inquiry.id}
              email={inquiry.email ?? "방문자"}
              initialMessages={messages}
              closed={done}
            />
            <p className="mt-3 text-[13px] text-[#6e6e73]">
              방문자가 채팅방을 켜 두고 있으면 답장이 바로 보여요. 화면을 닫았다면 다시 들어왔을 때 보여요.
              {inquiry.email && " 급한 답은 \"이메일로 답장\"도 함께 보내 주세요."}
            </p>
          </>
        ) : (
          <div className="rounded-[16px] bg-white px-6 py-5 shadow-sm">
            <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.7] text-[#1d1d1f]/90">
              {inquiry.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
