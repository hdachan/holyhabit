// 글 라벨(eyebrow). 글쓰기 화면에서 이 중 하나를 고른다.
// 글 목록 카드와 글 페이지 제목 위에 표시된다. 라벨을 추가하려면 여기에만 넣으면 된다.
export const POST_LABELS = ["헬스", "런닝", "기타"] as const;

/** 고를 수 있는 라벨인지. 예전 글의 라벨(예: "업데이트")은 바꾸지 않았다면 그대로 둘 수 있다. */
export function isAllowedLabel(label: string, previous?: string) {
  return (POST_LABELS as readonly string[]).includes(label) || label === previous;
}
