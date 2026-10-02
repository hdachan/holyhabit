import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { helvetica } from "@/lib/fonts";
import Header from "@/components/Header";
// 사이트 전역 설정은 lib/site.ts 한곳에서 관리한다.
// layout, 글 상세, sitemap, robots가 같은 값을 참조해야 브랜드명·주소가 어긋나지 않는다.
// (layout.tsx는 Next.js 규칙상 metadata 외의 상수를 export할 수 없어서 별도 파일로 분리)
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
} from "@/lib/site";

export const metadata: Metadata = {
  // 상대경로 메타 URL을 절대경로로 바꿔주는 기준 주소.
  // 없으면 canonical·OG 이미지가 상대경로로 나가서 검색엔진·카톡 미리보기가 제대로 못 읽는다.
  metadataBase: new URL(SITE_URL),

  title: {
    // 하위 페이지가 제목을 지정하지 않았을 때 쓰는 기본값 (주로 홈).
    default: DEFAULT_TITLE,
    // 하위 페이지가 제목을 지정하면 "글 제목 | holyhabit" 형태로 자동 완성된다.
    // 모든 페이지가 같은 제목을 쓰면 중복 판정을 받기 때문에 페이지별 고유 제목을 위한 장치.
    template: `%s | ${SITE_NAME}`,
  },

  description: DEFAULT_DESCRIPTION,

  // 브라우저·OS가 웹앱 이름으로 인식하는 값.
  applicationName: SITE_NAME,

  // 카카오톡·페이스북 등 링크 공유 시 미리보기 정보.
  // 주의: url(og:url)은 여기 넣지 않는다.
  // layout에 넣으면 모든 하위 페이지가 같은 og:url을 상속받아 전부 홈 주소로 공유된다.
  // og:url은 각 페이지에서 개별 지정한다.
  openGraph: {
    type: "website",
    // 한국어 사이트임을 명시.
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    // 기본 공유 이미지. 글 페이지는 대표 이미지가 있으면 그걸로 교체한다.
    // app/opengraph-image.png 파일 방식은 쓰지 않는다. 파일 방식이 코드 설정보다
    // 우선순위가 높아서 글마다 지정한 대표 이미지를 덮어쓸 수 있기 때문.
    images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
  },

  // 구글 서치콘솔·네이버 서치어드바이저 소유 확인용 메타 태그.
  // 코드는 배포 환경변수로 넣는다. 값이 없으면 태그가 출력되지 않는다.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
      ? {
          "naver-site-verification":
            process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION,
        }
      : undefined,
  },

  // X(트위터) 공유 시 큰 이미지 카드로 표시.
  twitter: {
    card: "summary_large_image",
  },

  // 주의: canonical(alternates.canonical)도 여기 넣지 않는다.
  // layout에 넣으면 모든 글이 "내 정본은 홈"이라고 선언하게 되어 글 페이지가 색인에서 빠진다.
  // canonical은 app/page.tsx(홈)와 각 글 페이지에서 개별 지정한다.
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="ko": 검색엔진에 한국어 페이지임을 알려 한국어 검색 결과에 맞게 분류되도록 한다.
    <html
      lang="ko"
      className={`${helvetica.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-helvetica)]">
        <Header />
        {children}
      </body>
      {/* 구글 애널리틱스(GA4). 측정 ID(G-XXXXXXX)를 환경변수에 넣으면 동작한다.
          값이 없으면 스크립트를 아예 넣지 않는다. */}
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}