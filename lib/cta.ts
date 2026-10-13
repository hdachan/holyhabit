// 글 하단 CTA(행동 유도 박스) 설정. posts 테이블의 cta(jsonb) 칸에 저장된다.
// 관리자 글쓰기 화면, 저장(Server Action), 글 페이지가 모두 이 형식을 쓴다.
// (다른 글 추천은 CTA에서 분리해 "연관 콘텐츠"(lib/related.ts)로 옮겼다)

// 링크 버튼: 앱 다운로드, 사전 신청, SNS 등으로 보내는 박스
export type PostCta = { type: "link"; text: string; buttonText: string; url: string };

const MAX_TEXT = 200;
const MAX_BUTTON_TEXT = 40;

/**
 * 저장된 값(또는 입력값)을 안전한 CTA로 바꾼다. 형식이 맞지 않으면 null(CTA 없음).
 * DB 값은 언제든 이상할 수 있어서 글 페이지에서도 이 함수를 거쳐서 쓴다.
 */
export function parseCta(raw: unknown): PostCta | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  if (value.type !== "link") return null;

  const text = typeof value.text === "string" ? value.text.trim().slice(0, MAX_TEXT) : "";
  const buttonText =
    typeof value.buttonText === "string"
      ? value.buttonText.trim().slice(0, MAX_BUTTON_TEXT)
      : "";
  const url = typeof value.url === "string" ? value.url.trim() : "";
  if (!buttonText || !isAllowedUrl(url)) return null;
  return { type: "link", text, buttonText, url };
}

/** https:// 주소 또는 내 사이트 주소(/로 시작)만 허용한다. javascript: 같은 위험한 링크를 막는다. */
export function isAllowedUrl(url: string) {
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}
