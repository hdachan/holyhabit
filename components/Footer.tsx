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
          <Link href="/about" className="hover:text-[#1d1d1f]">회사 소개</Link>
          <Link href={BLOG_PATH} className="hover:text-[#1d1d1f]">콘텐츠</Link>
          <Link href="/contact" className="hover:text-[#1d1d1f]">문의하기</Link>
          <Link href="/terms" className="hover:text-[#1d1d1f]">이용약관</Link>
          <Link href="/privacy" className="font-medium text-[#1d1d1f] hover:underline">
            개인정보처리방침
          </Link>

          {/* 공식 SNS: 테두리만 있는 네모 안에 아이콘 하나 */}
          <div className="mt-3 flex gap-2">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE_NAME} ${link.label} (새 창)`}
                title={link.label}
                className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-black/15 text-[#6e6e73] hover:border-[#1d1d1f] hover:text-[#1d1d1f]"
              >
                <SocialIcon name={link.icon} />
              </a>
            ))}
          </div>
        </nav>
      </div>
    </footer>
  );
}

// 선으로만 그린 SNS 아이콘 (글자색을 따라간다)
function SocialIcon({ name }: { name: "instagram" | "youtube" }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "instagram") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="2.5" y="5" width="19" height="14" rx="4" />
      <path d="M10 9.2v5.6l4.8-2.8z" />
    </svg>
  );
}
