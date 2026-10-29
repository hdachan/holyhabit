import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import PostGrid from "@/components/PostGrid";
import { BLOG_PATH, SITE_NAME, SITE_URL, SOCIAL_LINKS, postPath } from "@/lib/site";
import { pageOpenGraph } from "@/lib/seo";

const BLOG_DESCRIPTION =
  "혼자서는 작심삼일, 함께라면 계속할 이유가 생깁니다. 운동 습관, 헬스 초보 팁, 꾸준함을 만드는 방법까지 holyhabit의 습관 이야기를 만나보세요.";

// 콘텐츠(글 목록) 페이지 메타.
// canonical을 layout이 아닌 각 페이지에 두는 이유: layout에 두면 모든 하위 페이지가 상속받아
// 글 페이지까지 "정본은 홈"이라고 선언하게 된다.
export const metadata: Metadata = {
  title: "콘텐츠",
  // 메인과 설명이 같으면 중복 페이지로 보일 수 있어서 목록 전용 설명을 쓴다.
  description: BLOG_DESCRIPTION,
  alternates: { canonical: BLOG_PATH },
  openGraph: pageOpenGraph({
    title: `콘텐츠 | ${SITE_NAME}`,
    description: BLOG_DESCRIPTION,
    url: BLOG_PATH,
  }),
};

// 콘텐츠 목록 — Supabase의 posts 테이블에서 글을 가져옵니다.
// getAllPosts()는 캐싱되어 있어서, 관리자가 새 글을 쓰기 전까지는
// 방문자가 아무리 많아도 Supabase에 추가 쿼리가 나가지 않습니다.
// (자세한 내용은 lib/posts.ts 참고)
export default async function BlogPage() {
  const posts = await getAllPosts();

  // 검색엔진용: 이 페이지가 holyhabit의 글 모음이고, 어떤 글들이 들어 있는지 알려준다.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `콘텐츠 | ${SITE_NAME}`,
        description: BLOG_DESCRIPTION,
        url: `${SITE_URL}${BLOG_PATH}`,
        inLanguage: "ko-KR",
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: posts.map((post, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: post.seoTitle,
            url: `${SITE_URL}${postPath(post.slug)}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "콘텐츠" },
        ],
      },
    ],
  };

  return (
    <main className="flex-1 bg-white">
      <script
        type="application/ld+json"
        // "<"를 이스케이프해서 글 제목에 "</script>"가 들어가도 태그가 깨지지 않게 한다.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-[1156px] px-6 pb-24 pt-12 md:pt-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-[32px] font-bold tracking-tight text-[#212124] md:text-[40px]">
            모든 콘텐츠
          </h1>
          {/* 공식 SNS 바로가기 (lib/site.ts의 SOCIAL_LINKS) */}
          {SOCIAL_LINKS.length > 0 && (
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[10px] bg-[#f2f3f6] px-4 py-3 text-[15px] font-semibold text-[#212124] transition hover:bg-[#e9ebee]"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
        <PostGrid posts={posts} />
      </div>
    </main>
  );
}
