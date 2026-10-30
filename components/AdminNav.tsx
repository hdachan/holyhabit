"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth-actions";

// 관리자 화면 상단 메뉴. 어느 관리 화면에서든 다른 화면으로 바로 이동할 수 있다.
const LINKS = [
  { href: "/admin", label: "글 관리" },
  { href: "/admin/new", label: "새 글 쓰기" },
  { href: "/admin/profile", label: "내 작성자 정보" },
];
// 슈퍼 관리자에게만 보이는 메뉴
const INBOX = { href: "/super/inquiries", label: "문의함" };
// 슈퍼 관리자는 지출이 맨 앞에 온다
const SUPER_LINKS = [{ href: "/super/expenses", label: "지출" }, INBOX];

export default function AdminNav({
  email,
  waitingInquiries,
}: {
  email: string;
  // 슈퍼 관리자가 아니면 null (문의함 메뉴를 숨긴다)
  waitingInquiries: number | null;
}) {
  const links = waitingInquiries === null ? LINKS : [...SUPER_LINKS, ...LINKS];
  const pathname = usePathname();

  // 수정 화면(/admin/edit/...)은 "글 관리" 메뉴에 속한 것으로 표시한다.
  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin" || pathname.startsWith("/admin/edit")
      : pathname.startsWith(href);

  return (
    <div className="border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-[860px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-6">
        {/* 모바일: 메뉴가 줄바꿈되지 않고 한 줄로 옆으로 밀어서 본다 */}
        <nav className="-mx-4 flex w-[calc(100%+2rem)] items-center gap-1 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:w-auto md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[14px] font-medium md:px-4 ${
                isActive(link.href)
                  ? "bg-[#1d1d1f] text-white"
                  : "text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              {link.label}
              {/* 문의함: 확인이 필요한 수 (새 문의 + 답장을 기다리는 버그 제보) */}
              {link.href === INBOX.href && !!waitingInquiries && (
                <span className="ml-1.5 rounded-full bg-[#e8893a] px-1.5 py-0.5 text-[11px] font-bold text-white">
                  {waitingInquiries}
                </span>
              )}
            </Link>
          ))}
          <Link
            href="/"
            target="_blank"
            className="shrink-0 whitespace-nowrap px-3.5 py-1.5 text-[14px] text-[#6e6e73] hover:text-[#1d1d1f] md:px-4"
          >
            사이트 보기 ↗
          </Link>
        </nav>
        <div className="ml-auto flex min-w-0 items-center gap-4 text-[13px] text-[#6e6e73]">
          <span className="truncate">{email}</span>
          <form action={signOut}>
            <button className="shrink-0 whitespace-nowrap hover:text-[#1d1d1f]">로그아웃</button>
          </form>
        </div>
      </div>
    </div>
  );
}
