import type { Metadata } from "next";
import Image from "next/image";
import DownloadSection from "@/components/DownloadSection";
import ShipWheel from "@/components/ShipWheel";
import {
  SITE_URL,
  SITE_NAME,
  ORG_ID,
  DEFAULT_DESCRIPTION,
  OG_TITLE,
  SOCIAL_LINKS,
  BUSINESS_NAME,
  BUSINESS_REG_NO,
  BUSINESS_OWNER,
  BUSINESS_ADDRESS,
  CONTACT_EMAIL,
} from "@/lib/site";
import { pageOpenGraph } from "@/lib/seo";

// 메인(홈) = 앱 한 줄 소개 (첫 화면 한 칸). 회사 소개는 /about, 글 목록은 /blog.
// 제목·설명은 layout 기본값(lib/site.ts)을 쓰고 정본 주소만 지정한다.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: pageOpenGraph({
    title: OG_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/",
  }),
};

// 사이트 정보(JSON-LD). 구글은 WebSite 정보로 검색 결과에 사이트 이름("holyhabit")을 표시하고,
// Organization 정보로 로고와 공식 SNS를 연결한다. 메인 페이지에만 넣는다.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: SITE_NAME,
      alternateName: ["홀리해빗", "holyhabits", "홀리 해빗"],
      url: `${SITE_URL}/`,
      inLanguage: "ko-KR",
    },
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      // 사업자등록증의 상호와 번호. 검색엔진이 실제 운영 주체를 확인하는 데 쓴다.
      legalName: BUSINESS_NAME,
      alternateName: ["홀리해빗", "holyhabits", "홀리 해빗"],
      taxID: BUSINESS_REG_NO,
      founder: { "@type": "Person", name: BUSINESS_OWNER },
      address: {
        "@type": "PostalAddress",
        addressCountry: "KR",
        addressRegion: BUSINESS_ADDRESS.region,
        addressLocality: BUSINESS_ADDRESS.locality,
        streetAddress: BUSINESS_ADDRESS.street,
      },
      ...(CONTACT_EMAIL && {
        email: CONTACT_EMAIL,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: CONTACT_EMAIL,
          availableLanguage: "Korean",
        },
      }),
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/icon.png`,
      ...(SOCIAL_LINKS.length > 0 && { sameAs: SOCIAL_LINKS.map((l) => l.url) }),
    },
  ],
};

// 화면에 보이는 글. 여기만 고치면 문구가 바뀐다. (회사 소개 글은 app/about/page.tsx)
const HEADLINE = "오늘의 운동이\n오늘의 레벨업";
const INTRO = "운동을 손맛 있게 기록하고,\n모은 코인으로 캐릭터를 키우고 퀘스트를 깨보세요.";
// 베타테스트 신청 주소. 비어 있으면 "베타테스트 준비 중"(누를 수 없음)으로 보인다.
const APP_LINK: string = "https://forms.gle/QofLkXzGL13UmBq68";


// 기능 소개 칸들 (첫 화면 아래). 위에서부터 차례로 보이고, 그림은 오른쪽·왼쪽을 번갈아 놓는다.
type Feature = {
  title: string;
  text: string;
  image: { src: string; width: number; height: number; alt: string };
};
const FEATURES: Feature[] = [
  {
    // 운동 기록
    title: "기록하는 순간,\n이펙트가 터진다",
    text: "무게와 횟수를 적고 저장하면 화면이 번쩍.\n지루했던 운동일지가 손맛 나는 기록이 됩니다.\n헬스부터 홈트까지, 오늘의 오운완을 남겨보세요.",
    image: {
      src: "/feature-record.webp",
      width: 1024,
      height: 2000,
      alt: "홀리해빗 앱에서 벤치프레스 무게와 횟수를 기록하고 저장하는 순간 번개 이펙트가 터지는 화면",
    },
  },
  {
    // 캐릭터 (초안 문구)
    title: "운동한 만큼\n캐릭터가 자란다",
    text: "운동으로 모은 코인으로 미어캣 캐릭터를 레벨업하세요.\n체력과 공격력 같은 스탯이 오르고, 새로운 캐릭터를 모으고,\n방 안에 숨은 퀘스트까지 깨보세요.",
    image: {
      src: "/feature-character.webp",
      width: 1024,
      height: 2000,
      alt: "홀리해빗 앱 캐릭터 화면: 레벨 3 미어캣 캐릭터와 체력·공격력 스탯, 퀘스트 알림, 모은 캐릭터 카드",
    },
  },
  {
    // 몬스터 전투 (초안 문구)
    title: "키운 캐릭터로\n몬스터와 한판 승부",
    text: "운동으로 강해진 캐릭터가 몬스터와 싸워요.\n쌓아 온 체력과 공격력이 그대로 전투력이 되는 진짜 RPG.\n오늘의 운동이 내일의 승리가 됩니다.",
    image: {
      src: "/feature-battle.webp",
      width: 1034,
      height: 2000,
      alt: "홀리해빗 앱 전투 화면: 캐릭터가 몬스터 흑화 검정이에게 32 데미지를 주는 RPG 배틀 장면",
    },
  },
];

export default function HomePage() {
  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        // "<"를 이스케이프해서 값에 "</script>"가 들어가도 태그가 깨지지 않게 한다.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(siteJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* 첫 화면 한 칸: 왼쪽 그림 + 오른쪽 글 (휴대폰은 그림 위, 글 아래) */}
      <section className="relative mx-auto grid max-w-[1156px] items-center gap-10 px-6 py-16 md:min-h-[calc(100vh-62px)] md:grid-cols-2 md:gap-16 md:py-20">
        {/* 오른쪽 글 뒤에 있는 듯 없는 듯 깔린 얇은 키(배 운전대) 무늬 (휴대폰은 아래쪽 글 뒤). 대표 그림은 흰 바탕이라 mix-blend-multiply로 흰 부분이 비쳐 보이게 한다 */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <ShipWheel className="absolute left-1/2 top-[74%] w-[245px] -translate-x-1/2 -translate-y-1/2 text-[#7A5A3A] opacity-[0.05] md:left-[75%] md:top-1/2 md:w-[380px]" />
        </div>
        {/* 대표 그림: 노을 바다를 바라보는 미어캣 캐릭터 (public/hero.webp, 1254×1254) */}
        <Image
          src="/hero.webp"
          alt="망토를 두른 홀리해빗 미어캣 캐릭터가 절벽 위에서 노을 진 바다와 섬 마을을 바라보는 그림"
          width={1254}
          height={1254}
          priority
          sizes="(min-width: 768px) 520px, 100vw"
          className="relative mx-auto w-full max-w-[520px] mix-blend-multiply"
        />

        {/* 글 묶음은 오른쪽 끝을 상단바 메뉴(콘텐츠) 끝에 맞춘다 */}
        <div className="relative text-center md:text-right">
          {/* 페이지의 유일한 h1 */}
          <h1 className="whitespace-pre-line text-[36px] font-bold leading-[1.3] tracking-tight text-[#191f28] md:text-[52px]">
            {HEADLINE}
          </h1>
          <p className="mt-6 whitespace-pre-line text-[17px] leading-[1.8] text-[#4e5968] md:text-[19px]">{INTRO}</p>

          {/* 앱 연결 버튼. 베타테스트가 열리면 APP_LINK에 주소를 넣으면 눌리는 버튼으로 바뀐다. */}
          {APP_LINK ? (
            <a
              href={APP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-block rounded-[16px] bg-[#F4A259] px-10 py-4 text-[17px] font-bold text-white hover:brightness-95"
            >
              베타테스트 참여하기
            </a>
          ) : (
            <span
              aria-disabled="true"
              className="mt-10 inline-block cursor-default rounded-[16px] bg-[#e5e8eb] px-10 py-4 text-[17px] font-bold text-[#8b95a1]"
            >
              베타테스트 준비 중
            </span>
          )}
        </div>
      </section>


      {FEATURES.map((feature, i) => {
        // 짝수 번째(0, 2, …)는 글 왼쪽·그림 오른쪽, 홀수 번째는 그림 왼쪽·글 오른쪽. 휴대폰은 항상 글 위·그림 아래.
        const imageLeft = i % 2 === 1;
        return (
          <section key={feature.image.src} className={i % 2 === 0 ? "bg-[#f9fafb]" : "bg-white"}>
            <div className="mx-auto grid max-w-[1156px] items-center gap-12 px-6 py-20 md:grid-cols-2 md:gap-16 md:py-28">
              <div className={`text-center md:text-left ${imageLeft ? "md:order-2" : ""}`}>
                <h2 className="whitespace-pre-line text-[30px] font-bold leading-[1.35] tracking-tight text-[#191f28] md:text-[44px]">
                  {feature.title}
                </h2>
                <p className="mt-6 whitespace-pre-line text-[17px] leading-[1.8] text-[#4e5968] md:text-[19px]">
                  {feature.text}
                </p>
              </div>
              <Image
                src={feature.image.src}
                alt={feature.image.alt}
                width={feature.image.width}
                height={feature.image.height}
                sizes="(min-width: 768px) 320px, 70vw"
                className={`mx-auto w-[70%] max-w-[320px] rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] ${imageLeft ? "md:order-1" : ""}`}
              />
            </div>
          </section>
        );
      })}

      <DownloadSection />
    </main>
  );
}
