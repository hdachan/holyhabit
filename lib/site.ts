// lib/site.ts
// 사이트 전역 설정. layout, 글 상세, sitemap, robots가 공통으로 참조한다.
// 한곳에서 관리해야 브랜드명·주소가 페이지마다 어긋나지 않는다.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_NAME = "holyhabit";

// 검색 결과에 나오는 제목 (메타 제목)
export const DEFAULT_TITLE = "홀리해빗 - 운동이 게임이 되는 운동RPG";

// 검색 결과 제목 아래 설명 (메타 설명)
export const DEFAULT_DESCRIPTION =
  "운동을 손맛 있게 기록하고, 모은 코인으로 캐릭터를 키우고 퀘스트를 깨보세요. 운동이 게임이 되는 앱";

// 카톡·SNS에 링크를 공유했을 때 나오는 제목 (OG 제목)
export const OG_TITLE = "운동하면 레벨업하는 RPG 운동 앱 홀리해빗";

// 키워드 (메타 키워드). 구글은 거의 안 보지만 일부 검색엔진이 참고한다.
export const SITE_KEYWORDS = [
  "운동기록",
  "헬스기록",
  "운동일지",
  "오운완",
  "홈트",
  "RPG",
  "레벨업",
  "캐릭터",
  "퀘스트",
  "동기부여",
  "습관",
  "PT",
];
// 글 목록 주소. 글 주소는 postPath("column-001") → "/blog/column-001".
// 예전 주소(/news/...)는 next.config.ts에서 여기로 영구 이동(301)시킨다.
export const BLOG_PATH = "/blog";
export const postPath = (slug: string) => `${BLOG_PATH}/${slug}`;

// 링크 공유 시 기본 미리보기 이미지 (public/og.png, 1200×630 권장).
export const DEFAULT_OG_IMAGE = "/og.png";
// 기본 공유 이미지 정보: 크기를 미리 알려주면 카톡이 첫 공유부터 카드를 제대로 그린다.
export const DEFAULT_OG_IMAGE_META = {
  url: DEFAULT_OG_IMAGE,
  width: 1200,
  height: 630,
  alt: "운동이 게임이 되는 앱",
};

// 휴대폰 브라우저 주소창 색 (브랜드 색)
export const THEME_COLOR = "#F4A259";
// 서브 색 (바다 파랑). 메인 맨 아래 바다와 푸터 바탕에 쓴다.
export const SUB_COLOR = "#00B7FE";

// ── 기본 작성자
// 작성자 이름·소개는 관리자 계정마다 "내 작성자 정보"(/admin/profile)에서 입력한다.
// 작성자가 연결되지 않은 예전 글에는 아래 값이 대신 쓰인다.
export const AUTHOR_NAME = "피오니";
export const AUTHOR_BIO = "holyhabit에서 함께하면 더 즐거운 습관 이야기를 씁니다.";

// ── 사업자 정보 (푸터, 개인정보처리방침, 메인 페이지 JSON-LD Organization에 쓰인다)
// 사업자등록증에 적힌 그대로 쓴다. 검색엔진은 실제 사업자가 운영하는 사이트를 더 신뢰한다.
export const BUSINESS_NAME = "홀리해빗";
export const BUSINESS_REG_NO = "373-25-01972";
export const BUSINESS_OWNER = "황대찬";
// 검색엔진용 주소 정보(JSON-LD)는 나눠서 쓰고, 화면에는 이어 붙여서 보여준다.
export const BUSINESS_ADDRESS = {
  region: "서울특별시",
  locality: "성북구",
  street: "돌곶이로28길 48",
};
export const BUSINESS_ADDRESS_TEXT = `${BUSINESS_ADDRESS.region} ${BUSINESS_ADDRESS.locality} ${BUSINESS_ADDRESS.street}`;

// ── 연락처
// 비워두면 푸터에 "준비 중"으로 표시된다.
export const CONTACT_EMAIL = "holyhabits915@gmail.com";
export const CONTACT_HOURS = "평일 10:00~18:00, 영업일 기준 1~2일 내 답변";
// icon: 푸터에 보여줄 아이콘 종류 (components/Footer.tsx)
export const SOCIAL_LINKS: { label: string; url: string; icon: "instagram" | "youtube" }[] = [
  { label: "인스타그램", url: "https://www.instagram.com/holyhabit_official/", icon: "instagram" },
  { label: "유튜브", url: "https://www.youtube.com/@HolyHabits915", icon: "youtube" },
];
