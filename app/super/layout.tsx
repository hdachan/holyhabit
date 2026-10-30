import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, isSuperAdminEmail } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";
import { countWaitingInquiries } from "@/lib/inquiries-db";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// 슈퍼 관리자 화면(문의함)을 감싸는 틀. 로그인은 관리자와 같고(/login),
// SUPER_ADMIN_EMAILS에 있는 계정만 들어올 수 있다. 다른 관리자에게는 없는 주소처럼 보인다.
export default async function SuperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isSuperAdminEmail(user.email)) redirect("/admin");

  return (
    <>
      <AdminNav email={user.email ?? ""} waitingInquiries={await countWaitingInquiries()} />
      {children}
    </>
  );
}
