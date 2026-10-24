// HTML → 글자 변환 도구. 서버(lib/posts.ts)와 관리자 글쓰기 도우미(SeoHelper)가 같이 쓴다.
// 한곳에 둬야 도우미의 "검색 요약문 미리보기"가 실제 사이트에 나가는 요약문과 똑같아진다.

// 자주 나오는 HTML 엔티티 디코딩.
// 태그만 지우면 &nbsp; &amp; 등이 남아서 meta description에 그대로 노출된다.
function decodeEntities(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** 태그를 지우고 공백을 정리한 본문 글자 */
export function htmlToText(html: string) {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    // 보이지 않는 글자(폭 없는 공백 등). 다른 곳에서 복사해 붙여넣은 글에 섞여 들어와
    // 요약문에 "“오운완”​ 이라는"처럼 이상한 띄어쓰기를 만든다.
    .replace(/[​-‍﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** 검색 결과·카드에 쓰는 요약문 (본문 앞 maxLength자) */
export function stripHtmlToExcerpt(html: string, maxLength = 120) {
  const text = htmlToText(html);
  return text.length > maxLength
    ? `${text.slice(0, maxLength).trim()}...`
    : text;
}
