import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME, SOCIAL_LINKS } from "@/lib/site";

// 모든 페이지 맨 아래 푸터. 연락처·SNS는 lib/site.ts에서 관리한다(비어 있으면 "준비 중").
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-black/5 bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-12 text-[14px] text-[#6e6e73] md:flex-row md:justify-between md:px-10">
        <div>
          <p className="text-[16px] font-bold text-[#1d1d1f]">{SITE_NAME}</p>
          <p className="mt-1">함께 이어가는 즐거운 습관</p>
          <p className="mt-6">
            문의{" "}
            {CONTACT_EMAIL ? (
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1d1d1f] hover:underline">
                {CONTACT_EMAIL}
              </a>
            ) : (
              <span>준비 중</span>
            )}
          </p>
          <p className="mt-4 text-[13px]">
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
        </div>

        <nav className="flex flex-col gap-2 md:items-end">
          <Link href="/" className="hover:text-[#1d1d1f]">소개</Link>
          <Link href="/news" className="hover:text-[#1d1d1f]">콘텐츠</Link>
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1d1d1f]"
            >
              {link.label} ↗
            </a>
          ))}
          <Link href="/privacy" className="font-medium text-[#1d1d1f] hover:underline">
            개인정보처리방침
          </Link>
        </nav>
      </div>
    </footer>
  );
}
