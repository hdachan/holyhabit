import Link from "next/link";
import Image from "next/image";
import {
  BUSINESS_ADDRESS_TEXT,
  BUSINESS_NAME,
  BUSINESS_OWNER,
  BUSINESS_REG_NO,
  CONTACT_EMAIL,
  CONTACT_HOURS,
  SITE_NAME,
  SOCIAL_LINKS,
  BLOG_PATH,
} from "@/lib/site";

// 모든 페이지 맨 아래 푸터. 사업자 정보·연락처·SNS는 lib/site.ts에서 관리한다.
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-black/5 bg-white">
      <div className="mx-auto flex max-w-[1156px] flex-col gap-8 px-6 py-12 text-[14px] text-[#6e6e73] md:flex-row md:justify-between">
        <div>
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt={SITE_NAME} width={140} height={32} className="h-7 w-auto object-contain" />
          </Link>
          <p className="mt-1">함께 이어가는 즐거운 습관</p>

          {/* 사업자 정보 */}
          <div className="mt-6 flex flex-col gap-1 text-[13px]">
            <p>
              상호 {BUSINESS_NAME} · 대표 {BUSINESS_OWNER} · 사업자등록번호 {BUSINESS_REG_NO}
            </p>
            <p>주소 {BUSINESS_ADDRESS_TEXT}</p>
            <p>
              문의{" "}
              {CONTACT_EMAIL ? (
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1d1d1f] hover:underline">
                  {CONTACT_EMAIL}
                </a>
              ) : (
                <span>준비 중</span>
              )}
              {CONTACT_HOURS && ` (${CONTACT_HOURS})`}
            </p>
          </div>

          <p className="mt-4 text-[13px]">
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
        </div>

        <nav className="flex flex-col gap-2 md:items-end">
          <Link href="/" className="hover:text-[#1d1d1f]">소개</Link>
          <Link href={BLOG_PATH} className="hover:text-[#1d1d1f]">콘텐츠</Link>
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
          <Link href="/contact" className="hover:text-[#1d1d1f]">문의하기</Link>
          <Link href="/privacy" className="font-medium text-[#1d1d1f] hover:underline">
            개인정보처리방침
          </Link>
        </nav>
      </div>
    </footer>
  );
}
