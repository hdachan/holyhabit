import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { signOut } from "@/app/auth-actions";
import AdminNav from "@/components/AdminNav";
import { createSupabaseAdminClient } from "@/lib/supabase";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// 관리자 화면 전체를 감싸는 틀. 로그인과 관리자 여부를 서버에서 확인한다.
// (proxy.ts는 로그인 여부만 빠르게 거르고, 관리자 이메일 확인은 여기서 한다)
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!isAdminEmail(user.email)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#f5f5f7] py-24">
        <p className="text-[15px] text-[#1d1d1f]">
          관리자 권한이 없는 계정이에요.
        </p>
        <form action={signOut}>
          <button className="rounded-full bg-[#1d1d1f] px-5 py-2 text-[14px] text-white">
            로그아웃
          </button>
        </form>
      </div>
    );
  }

  // 메뉴의 "문의함" 옆에 확인이 필요한 수를 표시한다: 새 문의 + 답장을 기다리는 버그 제보
  const { count: waitingInquiries } = await createSupabaseAdminClient()
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new")
    .or("kind.eq.inquiry,last_sender.eq.user");

  return (
    <>
      <AdminNav email={user.email ?? ""} waitingInquiries={waitingInquiries ?? 0} />
      {children}
    </>
  );
}
