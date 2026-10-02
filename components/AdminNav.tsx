"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth-actions";

// 관리자 화면 상단 메뉴. 어느 관리 화면에서든 다른 화면으로 바로 이동할 수 있다.
const LINKS = [
  { href: "/admin", label: "글 관리" },
  { href: "/admin/new", label: "새 글 쓰기" },
];

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  // 수정 화면(/admin/edit/...)은 "글 관리" 메뉴에 속한 것으로 표시한다.
  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin" || pathname.startsWith("/admin/edit")
      : pathname.startsWith(href);

  return (
    <div className="border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-[860px] flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-1.5 text-[14px] font-medium ${
                isActive(link.href)
                  ? "bg-[#1d1d1f] text-white"
                  : "text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/"
            target="_blank"
            className="px-4 py-1.5 text-[14px] text-[#6e6e73] hover:text-[#1d1d1f]"
          >
            사이트 보기 ↗
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4 text-[13px] text-[#6e6e73]">
          <span>{email}</span>
          <form action={signOut}>
            <button className="hover:text-[#1d1d1f]">로그아웃</button>
          </form>
        </div>
      </div>
    </div>
  );
}
