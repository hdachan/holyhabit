// 작성자 정보. 관리자 계정마다 하나씩 있고(authors.id = 로그인 계정 id),
// 글을 쓰면 그 글에 쓴 사람이 연결된다(posts.author_id).
// 글 페이지의 작성자 이름·소개, JSON-LD author에 쓰인다.
export type Author = { name: string; bio: string };

export const AUTHOR_NAME_MAX = 20;
export const AUTHOR_BIO_MAX = 200;

/** 입력값 검사. 문제가 있으면 안내 문장, 없으면 null. 화면과 서버가 같이 쓴다. */
export function checkAuthorInput({ name, bio }: Author): string | null {
  if (!name.trim()) return "작성자 이름을 입력해주세요.";
  if (name.trim().length > AUTHOR_NAME_MAX) {
    return `작성자 이름은 ${AUTHOR_NAME_MAX}자 이내로 입력해주세요.`;
  }
  if (bio.trim().length > AUTHOR_BIO_MAX) {
    return `작성자 소개는 ${AUTHOR_BIO_MAX}자 이내로 입력해주세요.`;
  }
  return null;
}
