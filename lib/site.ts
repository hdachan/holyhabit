// lib/site.ts
// 사이트 전역 설정. layout, 글 상세, sitemap, robots가 공통으로 참조한다.
// 한곳에서 관리해야 브랜드명·주소가 페이지마다 어긋나지 않는다.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_NAME = "holyhabit";

export const DEFAULT_TITLE = "holyhabit 홀리해빗 | 함께 이어가는 즐거운 습관";

export const DEFAULT_DESCRIPTION =
  "목표를 혼자 버티지 마세요. holyhabit은 즐거움과 함께라는 가치로 다시 하고 싶어지는 습관을 만듭니다. 미어캣 레오와 함께 작은 성취를 발견하고, 어느새 달라진 나를 만나보세요.";
// 링크 공유 시 기본 미리보기 이미지 (public/og.png, 1200×630 권장).
export const DEFAULT_OG_IMAGE = "/og.png";

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
export const SOCIAL_LINKS: { label: string; url: string }[] = [
  { label: "인스타그램", url: "https://www.instagram.com/holyhabit_official/" },
];
