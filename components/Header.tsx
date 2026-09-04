import Link from "next/link";
import Image from "next/image";
import { helvetica } from "@/lib/fonts";

export default function Header() {
  return (
    <header className={`${helvetica.className} border-b border-black/5 bg-white`}>
      <div className="mx-auto flex h-[62px] max-w-[1800px] items-center justify-between px-6 md:px-10">
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
          <Link href="/about" className="hover:opacity-70">
            소개
          </Link>
          <Link href="/" className="hover:opacity-70">
            콘텐츠
          </Link>
        </nav>
      </div>
    </header>
  );
}