import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { CONTACT_EMAIL, CONTACT_HOURS, SITE_NAME } from "@/lib/site";
import { pageOpenGraph } from "@/lib/seo";

const CONTACT_DESCRIPTION = `${SITE_NAME} 홀리해빗에 궁금한 점, 제휴·광고 제안, 오류 신고를 남겨주세요. ${CONTACT_HOURS}`;

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

// 문의하기: 푸터에서만 들어온다. 접수된 문의는 관리자 화면 "문의함"에서 본다.
export default function ContactPage() {
  return (
    <main className="flex-1 bg-white">
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
        <ContactForm />
      </div>
    </main>
  );
}
