import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import InquiryActions from "@/components/InquiryActions";

type PageProps = {
  // ?status=done 이면 답변 완료, 없으면 새 문의
  searchParams: Promise<{ status?: string }>;
};

type Inquiry = {
  id: number;
  type: string;
  email: string;
  content: string;
  status: "new" | "done";
  created_at: string;
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

// 관리자 문의함: 문의하기(/contact)로 들어온 문의를 본다. 관리자 모두가 같은 문의함을 쓴다.
export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { status } = await searchParams;
  const current = status === "done" ? "done" : "new";

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("id, type, email, content, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const all = (data ?? []) as Inquiry[];
  const shown = all.filter((q) => q.status === current);
  const tabs = [
    { key: "new", label: "새 문의", href: "/admin/inquiries" },
    { key: "done", label: "답변 완료", href: "/admin/inquiries?status=done" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto max-w-[860px] px-6 py-16">
        <h1 className="mb-2 text-[28px] font-bold text-[#1d1d1f]">문의함</h1>
        <p className="mb-6 text-[14px] text-[#6e6e73]">
          답장은 &quot;답장 쓰기&quot;를 누르면 메일 앱에서 보낼 수 있어요. 답변을 마친 문의는 개인정보 보호를
          위해 삭제해 주세요.
        </p>

        <nav className="mb-6 flex gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`rounded-full px-4 py-1.5 text-[14px] font-medium ${
                tab.key === current ? "bg-[#1d1d1f] text-white" : "bg-white text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              {tab.label} {all.filter((q) => q.status === tab.key).length}
            </Link>
          ))}
        </nav>

        {shown.length === 0 ? (
          <p className="text-[15px] text-[#6e6e73]">
            {current === "new" ? "새 문의가 없어요." : "답변 완료한 문의가 없어요."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map((q) => (
              <div key={q.id} className="rounded-[16px] bg-white px-5 py-4 shadow-sm">
                <p className="text-[13px] font-medium text-[#6e6e73]">
                  {q.type} · {dateTimeFormatter.format(new Date(q.created_at))}
                </p>
                <p className="mt-1 text-[15px] font-semibold text-[#1d1d1f]">{q.email}</p>
                <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-[1.7] text-[#1d1d1f]/90">
                  {q.content}
                </p>
                <div className="mt-4 border-t border-black/5 pt-3">
                  <InquiryActions id={q.id} email={q.email} type={q.type} status={q.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
