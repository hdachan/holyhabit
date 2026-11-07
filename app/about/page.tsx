import type { Metadata } from "next";
import Link from "next/link";
import {
  SITE_NAME,
  SITE_URL,
  ORG_ID,
  BLOG_PATH,
  BUSINESS_NAME,
  BUSINESS_OWNER,
  BUSINESS_REG_NO,
  BUSINESS_ADDRESS_TEXT,
  CONTACT_EMAIL,
  CONTACT_HOURS,
  SOCIAL_LINKS,
} from "@/lib/site";
import { pageOpenGraph } from "@/lib/seo";

// 회사 소개: 슬로건·미션·핵심 가치 + 만드는 이유 + 앱 기능 + 회사 정보. 헤더·푸터의 "회사 소개"에서 들어온다.
const TITLE = "홀리해빗 - 운동이 게임이 되는 운동 RPG 앱";
// 검색 결과에 나오는 제목 (layout의 "| holyhabit" 자동 붙이기 대신 통째로 지정)
const META_TITLE = `홀리해빗 회사 소개 - 운동이 게임이 되는 RPG 운동 앱 | ${SITE_NAME}`;
const TAGLINE = "오늘의 운동이 오늘의 레벨업";
const INTRO =
  "홀리해빗은 운동을 타격감 있게 기록하고, 운동으로 모은 코인으로 캐릭터를 레벨업하며 퀘스트를 깨는 RPG 운동 앱입니다.";
const ROWS: { label: string; text: string }[] = [
  { label: "슬로건", text: "세상을 즐거움으로 바라본다." },
  { label: "미션", text: "사람들이 해야하는 일을 즐거움으로 마주하게 한다." },
  { label: "핵심 가치", text: "즐거움, 성취감" },
  { label: "카테고리", text: "운동 RPG" },
];

// 만드는 이유 (초안 문구: 대표님 확인 후 고쳐 쓰기)
const WHY_TITLE = "홀리해빗을 만드는 이유";
const WHY_TEXT = [
  "운동이 몸에 좋다는 건 누구나 알지만, 꾸준히 하기는 쉽지 않습니다. 저희는 그 이유가 의지가 부족해서가 아니라, 운동이 늘 '해야 하는 일'로만 느껴지기 때문이라고 생각했습니다.",
  "그래서 운동을 게임처럼 만들기로 했습니다. 기록하는 순간 손맛이 나고, 운동한 만큼 캐릭터가 자라고, 쌓아 온 노력이 승리로 돌아오는 경험. 해야 하는 운동을 하고 싶은 운동으로 바꾸는 것, 그것이 홀리해빗이 하는 일입니다.",
];

// 앱으로 할 수 있는 것 (메인 페이지 기능 소개와 같은 내용)
const FEATURES_TITLE = "홀리해빗 앱으로 할 수 있는 것";
const FEATURES: { title: string; text: string }[] = [
  {
    title: "손맛 나는 운동 기록",
    text: "무게와 횟수를 적고 저장하면 화면에 이펙트가 터집니다. 헬스부터 홈트까지, 지루했던 운동일지가 즐거운 오운완 기록이 됩니다.",
  },
  {
    title: "운동한 만큼 자라는 캐릭터",
    text: "운동으로 모은 코인으로 미어캣 캐릭터를 레벨업하세요. 체력과 공격력 같은 스탯을 올리고, 새로운 캐릭터를 모으고, 퀘스트를 깰 수 있습니다.",
  },
  {
    title: "몬스터와 한판 승부",
    text: "운동으로 강해진 캐릭터가 몬스터와 싸웁니다. 쌓아 온 체력과 공격력이 그대로 전투력이 되는 진짜 RPG입니다.",
  },
];

export const metadata: Metadata = {
  title: { absolute: META_TITLE },
  description: INTRO,
  alternates: { canonical: "/about" },
  openGraph: pageOpenGraph({
    title: `회사 소개 | ${SITE_NAME}`,
    description: INTRO,
    url: "/about",
  }),
};

// 검색엔진용: 회사 소개 페이지 + 위치(홈 > 회사 소개).
// 회사 정보(상호·사업자번호·로고·SNS)는 메인 페이지에 한 번만 적고, 여기서는 같은 회사(ORG_ID)라고 가리키기만 한다.
const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      name: `회사 소개 | ${SITE_NAME}`,
      description: INTRO,
      url: `${SITE_URL}/about`,
      inLanguage: "ko-KR",
      about: { "@id": ORG_ID },
      mainEntity: { "@id": ORG_ID },
    },
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      legalName: BUSINESS_NAME,
      url: `${SITE_URL}/`,
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

const h2Class = "text-[22px] font-bold leading-[1.4] text-[#191f28] md:text-[26px]";
const pClass = "text-[17px] leading-[1.8] text-[#4e5968]";

export default function AboutPage() {
  const companyRows: { label: string; value: React.ReactNode }[] = [
    { label: "상호", value: BUSINESS_NAME },
    { label: "대표", value: BUSINESS_OWNER },
    { label: "사업자등록번호", value: BUSINESS_REG_NO },
    { label: "주소", value: BUSINESS_ADDRESS_TEXT },
    ...(CONTACT_EMAIL
      ? [
          {
            label: "이메일",
            value: (
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                {CONTACT_EMAIL}
              </a>
            ),
          },
        ]
      : []),
    ...(CONTACT_HOURS ? [{ label: "운영 시간", value: CONTACT_HOURS }] : []),
  ];

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd).replace(/</g, "\\u003c") }}
      />
      <main className="mx-auto max-w-[760px] px-6 py-20 md:py-28">
        <h1 className="text-[28px] font-bold leading-[1.4] text-[#191f28] md:text-[36px]">{TITLE}</h1>
        <p className="mt-4 text-[18px] font-semibold text-[#e8893a] md:text-[20px]">{TAGLINE}</p>
        <p className={`mt-8 ${pClass}`}>{INTRO}</p>

        <dl className="mt-12 flex flex-col gap-6">
          {ROWS.map((row) => (
            <div key={row.label}>
              <dt className="text-[14px] font-bold text-[#8b95a1]">{row.label}</dt>
              <dd className="mt-1 text-[17px] text-[#191f28]">{row.text}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-20">
          <h2 className={h2Class}>{WHY_TITLE}</h2>
          {WHY_TEXT.map((text) => (
            <p key={text} className={`mt-4 ${pClass}`}>
              {text}
            </p>
          ))}
        </section>

        <section className="mt-20">
          <h2 className={h2Class}>{FEATURES_TITLE}</h2>
          <ul className="mt-6 flex flex-col gap-6">
            {FEATURES.map((f) => (
              <li key={f.title}>
                <h3 className="text-[18px] font-bold text-[#191f28]">{f.title}</h3>
                <p className={`mt-1 ${pClass}`}>{f.text}</p>
              </li>
            ))}
          </ul>
          <p className={`mt-6 ${pClass}`}>
            운동 습관과 동기부여에 관한 이야기는{" "}
            <Link href={BLOG_PATH} className="font-semibold text-[#191f28] underline">
              콘텐츠
            </Link>
            에서 읽어보세요.
          </p>
        </section>

        <section className="mt-20">
          <h2 className={h2Class}>회사 정보</h2>
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-[16px]">
            {companyRows.map((row) => (
              <div key={row.label} className="contents">
                <dt className="font-semibold text-[#8b95a1]">{row.label}</dt>
                <dd className="text-[#191f28]">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className={`mt-6 ${pClass}`}>
            제휴·문의는{" "}
            <Link href="/contact" className="font-semibold text-[#191f28] underline">
              문의하기
            </Link>
            로 남겨주세요.
            {SOCIAL_LINKS.length > 0 && " 새 소식은 "}
            {SOCIAL_LINKS.map((l, i) => (
              <span key={l.url}>
                {i > 0 && ", "}
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="underline">
                  {l.label}
                </a>
              </span>
            ))}
            {SOCIAL_LINKS.length > 0 && "에서 전해드려요."}
          </p>
        </section>
      </main>
    </div>
  );
}
