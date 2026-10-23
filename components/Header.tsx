"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BLOG_PATH } from "@/lib/site";

export default function Header() {
  const pathname = usePathname();
  // 지금 보고 있는 메뉴를 굵게 표시한다.
  const inBlog = pathname === BLOG_PATH || pathname.startsWith(`${BLOG_PATH}/`);

  return (
    <header className="border-b border-black/5 bg-white">
      {/* 상단 바 폭은 모든 페이지의 콘텐츠 폭(1156px)과 맞춘다 */}
      <div className="mx-auto flex h-[62px] max-w-[1156px] items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="HolyHabit"
            width={140}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>
        <nav className="flex items-center gap-10 text-[17px] text-[#1d1d1f]">
          <Link
            href="/"
            className={`hover:opacity-70 ${pathname === "/" ? "font-bold" : ""}`}
          >
            소개
          </Link>
          <Link href={BLOG_PATH} className={`hover:opacity-70 ${inBlog ? "font-bold" : ""}`}>
            콘텐츠
          </Link>
        </nav>
      </div>
    </header>
  );
}
