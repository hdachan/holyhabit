import sanitizeHtml from "sanitize-html";

// 글 본문 HTML 정리. 본문은 화면에 그대로 출력되므로(dangerouslySetInnerHTML)
// 저장 전에 에디터(Tiptap)가 만드는 태그만 남기고 나머지는 지운다.
// <script>, onclick 같은 이벤트 속성, javascript: 링크가 들어오면 여기서 걸러진다.
export function sanitizePostHtml(html: string) {
  return sanitizeHtml(html, {
    // StarterKit + Image + Link 확장이 만드는 태그
    allowedTags: [
      "p", "br", "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "em", "u", "s", "code", "pre", "blockquote",
      "ul", "ol", "li", "hr", "a", "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "class"],
      ol: ["start"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    // 새 창으로 열리는 링크가 원래 페이지를 조작하지 못하게 막는다.
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs:
          attribs.target === "_blank"
            ? { ...attribs, rel: "noopener noreferrer nofollow" }
            : attribs,
      }),
    },
  });
}
