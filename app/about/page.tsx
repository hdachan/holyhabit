import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { pageOpenGraph } from "@/lib/seo";

// 회사 소개: 슬로건·미션·핵심 가치. 헤더·푸터의 "소개"에서 들어온다.
const TITLE = "홀리해빗 - 운동이 게임이 되는 운동 RPG 앱";
const TAGLINE = "오늘의 운동이 오늘의 레벨업";
const INTRO =
  "홀리해빗은 운동을 타격감 있게 기록하고, 운동으로 모은 코인으로 캐릭터를 레벨업하며 퀘스트를 깨는 RPG 운동 앱입니다.";
const ROWS: { label: string; text: string }[] = [
  { label: "슬로건", text: "세상을 즐거움으로 바라본다." },
  { label: "미션", text: "사람들이 해야하는 일을 즐거움으로 마주하게 한다." },
  { label: "핵심 가치", text: "즐거움, 성취감" },
  { label: "카테고리", text: "운동 RPG" },
];

export const metadata: Metadata = {
  title: "회사 소개",
  description: INTRO,
  alternates: { canonical: "/about" },
  openGraph: pageOpenGraph({
    title: `회사 소개 | ${SITE_NAME}`,
    description: INTRO,
    url: "/about",
  }),
};

// 검색엔진용: 회사 소개 페이지 + 위치(홈 > 회사 소개)
const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      name: `회사 소개 | ${SITE_NAME}`,
      description: INTRO,
      url: `${SITE_URL}/about`,
      inLanguage: "ko-KR",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "회사 소개", item: `${SITE_URL}/about` },
      ],
    },
  ],
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd).replace(/</g, "\\u003c") }}
      />
      <main className="mx-auto max-w-[760px] px-6 py-20 md:py-28">
        <h1 className="text-[28px] font-bold leading-[1.4] text-[#191f28] md:text-[36px]">{TITLE}</h1>
        <p className="mt-4 text-[18px] font-semibold text-[#e8893a] md:text-[20px]">{TAGLINE}</p>
        <p className="mt-8 text-[17px] leading-[1.8] text-[#4e5968]">{INTRO}</p>

        <dl className="mt-12 flex flex-col gap-6">
          {ROWS.map((row) => (
            <div key={row.label}>
              <dt className="text-[14px] font-bold text-[#8b95a1]">{row.label}</dt>
              <dd className="mt-1 text-[17px] text-[#191f28]">{row.text}</dd>
            </div>
          ))}
        </dl>
      </main>
    </div>
  );
}
