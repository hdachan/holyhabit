import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { InquiryKind } from "@/lib/inquiry";

type PageProps = {
  // ?kind=bug 이면 버그 제보, 없으면 문의 / ?status=done 이면 완료된 것
  searchParams: Promise<{ kind?: string; status?: string }>;
};

type InquiryRow = {
  id: number;
  kind: InquiryKind;
  type: string;
  email: string | null;
  content: string;
  status: "new" | "done";
  source: string;
  last_sender: "user" | "admin";
  last_message_at: string;
  inquiry_messages: { id: number; body: string }[];
};

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// 확인이 필요한 것: 새 문의, 답장을 기다리는 버그 제보
const needsAction = (q: InquiryRow) =>
  q.status === "new" && (q.kind === "inquiry" || q.last_sender === "user");

const STATUS_LABELS: Record<InquiryKind, { new: string; done: string }> = {
  inquiry: { new: "새 문의", done: "답변 완료" },
  bug: { new: "진행 중", done: "해결 완료" },
};

/*
 * 관리자 문의함. 관리자 모두가 같은 문의함을 쓴다.
 * - 문의: 문의하기 양식으로 들어온 것. 이메일로 답장하고 "답변 완료"로 옮긴다.
 * - 버그 제보: 채팅방. 채팅으로 답하고, 끝나면 "해결 완료"로 닫는다.
 * 확인이 필요한 것을 맨 위에, 그 안에서는 최근 순으로 보여준다.
 */
export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const kind: InquiryKind = params.kind === "bug" ? "bug" : "inquiry";
  const status = params.status === "done" ? "done" : "new";

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("id, kind, type, email, content, status, source, last_sender, last_message_at, inquiry_messages(id, body)")
    .order("last_message_at", { ascending: false });
  if (error) throw new Error(error.message);

  const all = (data ?? []) as InquiryRow[];
  const ofKind = all.filter((q) => q.kind === kind);
  const shown = ofKind
    .filter((q) => q.status === status)
    .sort((a, b) => Number(needsAction(b)) - Number(needsAction(a)));

  const href = (k: InquiryKind, s: "new" | "done") => {
    const query = new URLSearchParams();
    if (k === "bug") query.set("kind", "bug");
    if (s === "done") query.set("status", "done");
    const qs = query.toString();
    return `/admin/inquiries${qs ? `?${qs}` : ""}`;
  };
  const kindTabs: { key: InquiryKind; label: string }[] = [
    { key: "inquiry", label: "문의" },
    { key: "bug", label: "버그 제보" },
  ];
  const labels = STATUS_LABELS[kind];

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto max-w-[860px] px-6 py-16">
        <h1 className="mb-2 text-[28px] font-bold text-[#1d1d1f]">문의함</h1>
        <p className="mb-6 text-[14px] leading-[1.7] text-[#6e6e73]">
          {kind === "inquiry"
            ? "문의는 이메일로 답장하고, 답장했으면 \"답변 완료로 표시\"를 눌러 주세요."
            : "버그 제보는 채팅으로 답하고, 해결되면 \"해결 완료\"를 눌러 닫아 주세요."}{" "}
          새로 들어와도 알림은 오지 않으니 자주 확인해 주세요.
          <br />
          완료한 것은 더 필요 없으면 개인정보 보호를 위해 삭제해 주세요.
        </p>

        {/* 종류: 문의 / 버그 제보 (확인이 필요한 수) */}
        <nav className="mb-3 flex gap-6 border-b border-black/10">
          {kindTabs.map((tab) => {
            const count = all.filter((q) => q.kind === tab.key && needsAction(q)).length;
            return (
              <Link
                key={tab.key}
                href={href(tab.key, "new")}
                className={`-mb-px border-b-2 pb-3 text-[16px] font-semibold ${
                  tab.key === kind ? "border-[#1d1d1f] text-[#1d1d1f]" : "border-transparent text-[#6e6e73] hover:text-[#1d1d1f]"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className="ml-1.5 rounded-full bg-[#e8893a] px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 처리 상태 */}
        <nav className="mb-6 flex gap-2">
          {(["new", "done"] as const).map((s) => (
            <Link
              key={s}
              href={href(kind, s)}
              className={`rounded-full px-4 py-1.5 text-[14px] font-medium ${
                s === status ? "bg-[#1d1d1f] text-white" : "bg-white text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              {labels[s]} {ofKind.filter((q) => q.status === s).length}
            </Link>
          ))}
        </nav>

        {shown.length === 0 ? (
          <p className="text-[15px] text-[#6e6e73]">{labels[status]} 항목이 없어요.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map((q) => {
              const last = q.inquiry_messages.reduce<{ id: number; body: string } | null>(
                (a, m) => (!a || m.id > a.id ? m : a),
                null
              );
              const badge =
                q.status === "done"
                  ? { label: labels.done, className: "bg-[#e9ebee] text-[#6e6e73]" }
                  : q.kind === "inquiry"
                    ? { label: "새 문의", className: "bg-[#fff4ea] text-[#e8893a]" }
                    : q.last_sender === "user"
                      ? { label: "답장 기다리는 중", className: "bg-[#fff4ea] text-[#e8893a]" }
                      : { label: "답변함 · 방문자 확인 대기", className: "bg-[#e8f3ff] text-[#1b64da]" };
              return (
                <Link
                  key={q.id}
                  href={`/admin/inquiries/${q.id}`}
                  className="block rounded-[16px] bg-white px-5 py-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-[#6e6e73]">
                    <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                    <span>
                      {q.kind === "inquiry" && `${q.type} · `}
                      {dateTimeFormatter.format(new Date(q.last_message_at))}
                      {q.source !== "web" && ` · ${q.source}`}
                    </span>
                  </div>
                  <p className="mt-1 text-[15px] font-semibold text-[#1d1d1f]">{q.email ?? "이메일 없음"}</p>
                  <p className="mt-1 truncate text-[14px] text-[#1d1d1f]/70">{last?.body ?? q.content}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
