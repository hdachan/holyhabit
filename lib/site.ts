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

// ── 작성자 (글 페이지 제목 아래·본문 끝, JSON-LD author에 쓰인다)
// 모든 글에 같은 이름을 쓴다. 검색엔진은 "누가 썼는지"가 일관된 사이트를 더 신뢰한다.
export const AUTHOR_NAME = "피오니";
export const AUTHOR_BIO = "holyhabit에서 함께하면 더 즐거운 습관 이야기를 씁니다.";

// ── 푸터 연락처 (임시)
// 비워두면 푸터에 "준비 중"으로 표시된다. 정해지면 여기만 고치면 된다.
export const CONTACT_EMAIL = "";
// 예: [{ label: "인스타그램", url: "https://instagram.com/holyhabit" }]
export const SOCIAL_LINKS: { label: string; url: string }[] = [];
