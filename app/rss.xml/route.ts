import { getAllPosts } from "@/lib/posts";
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
} from "@/lib/site";

// /rss.xml — 새 글 소식 피드. 네이버 서치어드바이저에 "RSS 제출"로 등록한다.
// getAllPosts는 캐시된 목록을 쓰므로 글을 쓰거나 고치면 sitemap과 함께 자동 갱신된다.

// RSS는 XML이라 제목·요약에 &, < 같은 문자가 있으면 파일이 깨진다. 미리 바꿔 둔다.
function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  // 피드가 너무 커지지 않게 최신 글 50개만 넣는다.
  const posts = (await getAllPosts()).slice(0, 50);

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/news/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.seoTitle)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(DEFAULT_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(DEFAULT_DESCRIPTION)}</description>
    <language>ko</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <generator>${SITE_NAME}</generator>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
