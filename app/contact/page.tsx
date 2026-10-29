import type { Metadata } from "next";
import ContactTabs from "@/components/ContactTabs";
import { BUSINESS_NAME, CONTACT_EMAIL, CONTACT_HOURS, SITE_NAME, SITE_URL } from "@/lib/site";
import { pageOpenGraph } from "@/lib/seo";

const CONTACT_DESCRIPTION = `${SITE_NAME} 홀리해빗에 궁금한 점, 제휴·광고 제안을 남기거나, 사이트 이용 중 발견한 버그를 제보해주세요. ${CONTACT_HOURS}`;

export const metadata: Metadata = {
  title: "문의하기",
  description: CONTACT_DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: pageOpenGraph({
    title: `문의하기 | ${SITE_NAME}`,
    description: CONTACT_DESCRIPTION,
    url: "/contact",
  }),
};

// 문의하기: 푸터에서만 들어온다. 탭 두 개 — 문의하기(양식, 이메일 답장) / 버그 제보(채팅방).
// 관리자는 "문의함"에서 확인하고 답한다.
export default function ContactPage() {
  // 검색엔진용: 이 페이지가 홀리해빗의 연락처 페이지이고, 어디로 어떻게 연락하는지 알려준다.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `문의하기 | ${SITE_NAME}`,
    description: CONTACT_DESCRIPTION,
    url: `${SITE_URL}/contact`,
    inLanguage: "ko-KR",
    about: {
      "@type": "Organization",
      name: SITE_NAME,
      legalName: BUSINESS_NAME,
      url: `${SITE_URL}/`,
      ...(CONTACT_EMAIL && {
        email: CONTACT_EMAIL,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: CONTACT_EMAIL,
          url: `${SITE_URL}/contact`,
          availableLanguage: "Korean",
          // CONTACT_HOURS(평일 10:00~18:00)와 같은 값
          hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "10:00",
            closes: "18:00",
          },
        },
      }),
    },
  };

  return (
    <main className="flex-1 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-[640px] px-6 pb-24 pt-12 md:pt-16">
        <h1 className="text-[32px] font-bold tracking-tight text-[#212124] md:text-[40px]">문의하기</h1>
        <p className="mb-10 mt-3 text-[16px] leading-[1.7] text-[#4d5159]">
          궁금한 점이나 제안을 남겨주세요. {CONTACT_HOURS}
          {CONTACT_EMAIL && (
            <>
              <br />
              메일로 직접 보내셔도 돼요:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                {CONTACT_EMAIL}
              </a>
            </>
          )}
        </p>
        <ContactTabs />
      </div>
    </main>
  );
}
