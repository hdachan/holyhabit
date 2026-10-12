import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

// /sitemap.xml로 제공된다. 구글 서치콘솔·네이버 서치어드바이저에 이 주소를 제출한다.
// getAllPosts는 캐시된 목록을 쓰므로 크롤러가 자주 와도 DB 쿼리가 늘지 않고,
// 글을 쓰거나 고치면 "posts" 캐시가 갱신되어 sitemap에도 바로 반영된다.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  return [
    // 홈(브랜드 소개)
    { url: SITE_URL },
    // 글 목록은 최신 글이 올라올 때마다 바뀌므로 가장 최근 글 시각을 lastmod로 쓴다.
    { url: `${SITE_URL}/news`, lastModified: posts[0]?.updatedAt },
    ...posts.map((post) => ({
      url: `${SITE_URL}/news/${post.slug}`,
      lastModified: post.updatedAt,
    })),
  ];
}
