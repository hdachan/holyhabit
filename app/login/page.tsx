import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "관리자 로그인",
  // 로그인 화면은 검색 결과에 나올 필요가 없다.
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-[#f5f5f7] px-6 py-24">
      <div className="w-full max-w-[380px] rounded-[20px] bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-[24px] font-bold text-[#1d1d1f]">
          관리자 로그인
        </h1>
        <LoginForm next={next ?? "/admin"} />
      </div>
    </div>
  );
}
