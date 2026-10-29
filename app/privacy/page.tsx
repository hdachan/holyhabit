import type { Metadata } from "next";
import {
  BUSINESS_ADDRESS_TEXT,
  BUSINESS_NAME,
  BUSINESS_OWNER,
  BUSINESS_REG_NO,
  CONTACT_EMAIL,
  CONTACT_HOURS,
  SITE_NAME,
} from "@/lib/site";
import { pageOpenGraph } from "@/lib/seo";

// ⚠️ 임시 초안. 실제로 수집하는 정보와 맞는지 확인한 뒤 확정하고,
// 확정되면 아래 robots(noindex)를 지운다.
// (참고: 개인정보보호위원회 "개인정보 처리방침 만들기" 도구)
export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${SITE_NAME} 개인정보처리방침`,
  alternates: { canonical: "/privacy" },
  openGraph: pageOpenGraph({
    title: `개인정보처리방침 | ${SITE_NAME}`,
    description: `${SITE_NAME} 개인정보처리방침`,
    url: "/privacy",
  }),
  robots: { index: false, follow: true },
};

const EFFECTIVE_DATE = "2026년 10월 12일";

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. 수집하는 개인정보",
    body: [
      "방문 기록: 웹사이트 이용 통계를 위해 Google Analytics가 쿠키를 통해 접속 기기, 브라우저, 방문 페이지, 유입 경로 등의 정보를 수집합니다. 이 정보로 개인을 직접 식별하지 않습니다.",
      "문의 정보: 문의하기 양식 또는 이메일로 문의하시는 경우 이메일 주소, 문의 유형, 문의 내용을 받습니다.",
      "버그 제보 정보: 버그 제보 시 제보 내용(이후 주고받는 대화 포함)과, 적으신 경우 이메일 주소를 받습니다.",
      "문의하기 양식과 버그 제보는 수집·이용에 동의하신 경우에만 접수됩니다.",
      "버그 제보 채팅방 열쇠: 보낸 제보를 같은 브라우저에서 다시 볼 수 있도록, 채팅방을 여는 무작위 값을 이용자의 브라우저에 저장합니다. 브라우저 저장 데이터를 지우면 함께 삭제됩니다.",
    ],
  },
  {
    heading: "2. 이용 목적",
    body: [
      "웹사이트 이용 현황 분석 및 콘텐츠 개선",
      "문의에 대한 답변, 버그 제보 확인 및 답변",
    ],
  },
  {
    heading: "3. 보유 및 이용 기간",
    body: [
      "방문 기록: Google Analytics 보관 설정 기간 동안 보관 후 삭제됩니다.",
      "문의·버그 제보 정보: 처리 완료 후 지체 없이 파기합니다. 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.",
    ],
  },
  {
    heading: "4. 개인정보 처리 위탁 및 국외 이전",
    body: [
      "Google LLC (Google Analytics): 웹사이트 이용 통계 분석",
      "Vercel Inc.: 웹사이트 호스팅",
      "Supabase Inc.: 데이터 저장 (문의하기·버그 제보로 접수된 내용과 대화 포함)",
      "위 업체는 해외에 서버를 두고 있어 정보가 국외에서 처리될 수 있습니다.",
    ],
  },
  {
    heading: "5. 쿠키 거부 방법",
    body: [
      "브라우저 설정에서 쿠키 저장을 거부할 수 있습니다. 쿠키를 거부해도 웹사이트 이용에는 제한이 없습니다.",
    ],
  },
  {
    heading: "6. 이용자의 권리",
    body: [
      "이용자는 언제든지 자신의 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있으며, 아래 문의처로 연락하시면 지체 없이 조치하겠습니다.",
    ],
  },
  {
    // 개인정보 보호법상 보호책임자의 이름과 연락처를 적어야 한다. 1인 사업자는 대표자가 맡는다.
    heading: "7. 개인정보 보호책임자",
    body: [
      `보호책임자: ${BUSINESS_OWNER} (대표)`,
      `이메일: ${CONTACT_EMAIL || "준비 중"}`,
      `문의 가능 시간: ${CONTACT_HOURS}`,
    ],
  },
  {
    heading: "8. 운영자 정보",
    body: [
      `상호: ${BUSINESS_NAME} · 대표: ${BUSINESS_OWNER} · 사업자등록번호: ${BUSINESS_REG_NO}`,
      `주소: ${BUSINESS_ADDRESS_TEXT}`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="flex-1 bg-[#f5f5f7]">
      <div className="mx-auto max-w-[760px] px-6 py-16 md:py-24">
        <h1 className="text-[32px] font-bold text-[#1d1d1f]">개인정보처리방침</h1>
        <p className="mt-3 text-[15px] leading-[1.7] text-[#6e6e73]">
          {BUSINESS_NAME}(이하 &quot;회사&quot;)는 {`${SITE_NAME} 웹사이트`}(이하 &quot;사이트&quot;)를 운영하며, 이용자의 개인정보를 중요하게 생각하고
          「개인정보 보호법」 등 관련 법령을 준수합니다.
        </p>

        <div className="mt-10 flex flex-col gap-8 rounded-[24px] bg-white p-7 md:p-10">
          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="text-[18px] font-bold text-[#1d1d1f]">{section.heading}</h2>
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-[#1d1d1f]/80">
                {section.body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-6 text-[14px] text-[#8e8e93]">시행일: {EFFECTIVE_DATE}</p>
      </div>
    </main>
  );
}
