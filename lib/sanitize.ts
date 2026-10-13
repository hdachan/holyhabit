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
    transformTags: {
      // 내 사이트 링크(/...)는 같은 탭에서 열고 rel을 붙이지 않는다.
      //   nofollow가 붙으면 검색엔진이 내 글끼리의 링크를 따라가지 않아 내부 링크 효과가 사라진다.
      // 외부 링크는 새 탭으로 열고, 원래 페이지를 조작하지 못하게 noopener를 붙인다.
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external = /^(https?:)?\/\//i.test(href);
        const { target: _target, rel: _rel, ...rest } = attribs;
        return {
          tagName,
          // 외부 주소(http·https)일 때만 새 탭. 내 사이트 주소, 메일 주소,
          // 그리고 위험해서 곧 지워질 주소(javascript: 등)에는 아무것도 붙이지 않는다.
          attribs: !external
            ? rest
            : { ...rest, target: "_blank", rel: "noopener noreferrer" },
        };
      },
    },
  });
}
