import { BLOG_PATH, SITE_URL, postPath } from "./site";

// 에디터 🔗 링크 입력값 정리.
// 사람마다 내 글 주소를 다르게 입력해서(column-002 / blog/column-002 / 사이트 전체 주소)
// 링크가 깨지거나(예: blog/x → /blog/blog/x) 도우미가 내 글 링크로 인식하지 못했다.
// 내 글은 항상 "/blog/글주소" 형태로, 외부 사이트는 https:// 주소로 맞춘다.
// 예전 주소(news/...)로 입력해도 새 주소로 바꿔준다.

const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";

export function normalizeLinkInput(raw: string): { href: string } | { error: string } {
  const value = raw.trim();
  if (!value) return { error: "링크를 입력해주세요." };

  // 1) 글 주소만: column-002
  if (new RegExp(`^${SLUG}$`).test(value)) return { href: postPath(value) };

  // 2) 사이트 안 주소: /blog/column-002, blog/column-002, /news/column-002(예전), /about
  const internal = value.match(new RegExp(`^/?(?:blog|news)/(${SLUG})/?$`));
  if (internal) return { href: postPath(internal[1]) };
  if (value.startsWith("/") && !value.startsWith("//")) return { href: value };

  // 3) 전체 주소
  const withProtocol = /^www\./i.test(value) ? `https://${value}` : value;
  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return {
      error: `주소 형식을 확인해주세요.\n내 글: ${BLOG_PATH}/글주소 (예: ${postPath("column-002")})\n외부 사이트: https://...`,
    };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:" && url.protocol !== "mailto:") {
    return { error: "https:// 로 시작하는 주소만 넣을 수 있어요." };
  }

  // 내 사이트 전체 주소(https://holyhabit.../blog/x)는 /blog/x로 줄인다.
  // 도메인이 바뀌어도 링크가 깨지지 않는다.
  const siteHost = new URL(SITE_URL).host;
  if (url.host === siteHost || url.host === `www.${siteHost}`) {
    const old = url.pathname.match(new RegExp(`^/news/(${SLUG})/?$`));
    if (old) return { href: postPath(old[1]) + url.search + url.hash };
    return { href: url.pathname + url.search + url.hash || "/" };
  }
  return { href: url.toString() };
}
