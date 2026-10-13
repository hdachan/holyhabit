// 연관 콘텐츠: 글 아래에 보여줄 "함께 읽을 글". 글쓴이가 직접 고른다.
// posts 테이블의 related_slugs(text[]) 칸에 저장된다.

/** 글마다 꼭 골라야 하는 연관 글 수 */
export const RELATED_COUNT = 3;

/** 고를 수 있는 다른 글이 3개보다 적으면(사이트 초기) 있는 만큼만 고르면 된다. */
export function requiredRelatedCount(availablePosts: number) {
  return Math.min(RELATED_COUNT, availablePosts);
}

/** 글 선택 목록에 쓰는 글 정보 */
export type PostOption = { slug: string; title: string };

/** 저장된 값을 안전한 글 주소 목록으로 바꾼다. */
export function parseRelatedSlugs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [
    ...new Set(
      raw.filter((s): s is string => typeof s === "string" && /^[a-z0-9-]+$/.test(s))
    ),
  ].slice(0, RELATED_COUNT);
}
