import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllPosts, getPost, getRelatedPosts } from "@/lib/posts";
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  AUTHOR_NAME,
  AUTHOR_BIO,
} from "@/lib/site";
import PostCtaBox from "@/components/PostCtaBox";

type PageProps = {
  // Next.js 15부터 params가 Promise로 전달됩니다. 14 이하에서도
  // await은 일반 값에 대해 즉시 통과되므로 아래 방식이 두 버전 모두에서 동작합니다.
  params: Promise<{ slug: string }> | { slug: string };
};

// 정적 경로 생성 (빌드 시 현재 Supabase에 있는 글 기준으로 미리 만들어둡니다)
// 빌드 이후 새로 쓴 글은 첫 요청 때 서버에서 렌더링되어 캐시됩니다.
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// 글마다 고유한 메타 정보 생성.
// 없으면 모든 글이 layout의 기본 제목·설명을 공유해서 중복 페이지로 판정된다.
// getPost는 캐시된 목록에서 찾기 때문에 페이지 본문과 여기서 두 번 호출해도 쿼리는 한 번이다.
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPost(slug);

  // 글이 없으면 빈 값 반환. 404 처리는 아래 페이지 컴포넌트의 notFound()가 담당한다.
  if (!item) return {};

  const url = `/news/${item.slug}`;

  return {
    // layout의 title.template이 적용되어 "글 제목 | holyhabit"으로 출력된다.
    // 화면용 title은 디자인상 줄바꿈이 있어서 한 줄로 정리된 seoTitle을 사용.
    title: item.seoTitle,

    // 본문 요약. 비어 있으면(undefined) layout의 기본 설명이 대신 쓰인다.
    description: item.excerpt || undefined,

    // 이 글의 정본 주소. 쿼리스트링이 붙은 주소 등 변형 URL이
    // 이 주소 하나로 모이도록 검색엔진에 알려준다.
    alternates: { canonical: url },

    // 카톡·페이스북 공유 미리보기.
    // 하위 페이지에서 openGraph를 지정하면 layout의 openGraph가 병합되지 않고 통째로 교체되므로
    // siteName, locale을 여기서 다시 넣어야 한다.
    openGraph: {
      type: "article",
      locale: "ko_KR",
      siteName: SITE_NAME,
      url,
      title: item.seoTitle,
      description: item.excerpt || undefined,
      // 발행·수정 시각. 검색엔진과 SNS가 글의 최신성을 판단하는 데 쓴다.
      publishedTime: item.publishedAt,
      modifiedTime: item.updatedAt,
      // 대표 이미지가 있으면 공유 썸네일로 사용, 없으면 사이트 기본 로고.
      // openGraph는 layout과 병합되지 않으므로 기본 이미지도 여기서 직접 지정해야 한다.
      images: [
        { url: item.imageUrl ?? DEFAULT_OG_IMAGE, alt: item.seoTitle },
      ],
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getPost(slug);

  // 목록에 없는 slug만 404. Supabase 조회 실패는 posts.ts에서 throw되어
  // 404가 아닌 에러로 처리되므로 "없음"과 "못 가져옴"이 구분된다.
  if (!item) {
    notFound();
  }

  // 연관 콘텐츠: 글쓴이가 고른 글 3개 (고른 글이 없는 예전 글은 최신 글로 채움)
  const related = await getRelatedPosts(item, 3);

  // 구조화 데이터(JSON-LD). 검색엔진에 "이 페이지는 기사"라고 알려서
  // 검색 결과에 발행일·작성자·대표 이미지가 정확히 표시되도록 돕는다.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: item.seoTitle,
    description: item.excerpt || undefined,
    image: [new URL(item.imageUrl ?? DEFAULT_OG_IMAGE, SITE_URL).href],
    datePublished: item.publishedAt,
    dateModified: item.updatedAt,
    mainEntityOfPage: `${SITE_URL}/news/${item.slug}`,
    author: { "@type": "Person", name: AUTHOR_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
    },
  };

  // 경로 정보(JSON-LD). 구글 검색 결과에 주소 대신 "holyhabit › 콘텐츠 › 글 제목" 경로로 표시될 수 있다.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "콘텐츠", item: `${SITE_URL}/news` },
      { "@type": "ListItem", position: 3, name: item.seoTitle },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        // "<"를 이스케이프해서 글 제목·요약에 "</script>"가 들어가도 태그가 깨지지 않게 한다.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main className="bg-[#f5f5f7]">
        {/* <article>: 검색엔진에 이 영역이 독립된 글 본문임을 알려준다. 스타일에는 영향 없음 */}
        <article>
          {/* 대표 사진 자리 — 화면 맨 위, 전체 폭 */}
          {item.imageUrl ? (
            <div className="relative h-[360px] w-full md:h-[480px]">
              <Image
                src={item.imageUrl}
                // alt는 이미지 검색·접근성에 쓰이므로 줄바꿈 없는 seoTitle 사용
                alt={item.seoTitle}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="flex h-[360px] w-full items-center justify-center bg-[#e5e5e7] text-[14px] text-[#8e8e93] md:h-[480px]">
              사진 준비중
            </div>
          )}

          <div className="mx-auto max-w-[760px] px-[18px] py-12">
            {/* 콘텐츠 목록으로 돌아가기 */}
            <Link
              href="/news"
              className="mb-8 inline-flex items-center gap-1 text-[15px] text-[#6e6e73] hover:text-[#1d1d1f]"
            >
              ← 콘텐츠 목록으로 돌아가기
            </Link>

            {/* 글 (제목/메타) */}
            <p className="mb-3 text-[15px] font-medium text-[#6e6e73]">
              {item.eyebrow}
            </p>
            <h1 className="mb-4 text-[36px] font-bold leading-[1.2] text-[#1d1d1f] md:text-[44px]">
              {item.title}
            </h1>
            {/* <time dateTime>: 사람에겐 "2026년 7월 24일", 기계에겐 ISO 날짜를 함께 제공 */}
            <p className="mb-10 text-[15px] text-[#6e6e73]">
              <span className="font-medium text-[#1d1d1f]">{AUTHOR_NAME}</span>
              {" · "}
              <time dateTime={item.publishedAt}>{item.date}</time>
            </p>

            {/* 본문 — Tiptap 에디터에서 저장된 HTML */}
            <div
              className="post-body text-[18px] leading-[1.7] text-[#1d1d1f]/90"
              dangerouslySetInnerHTML={{ __html: item.body }}
            />

            {/* 작성자 소개 — 누가 썼는지 보여줘서 글의 신뢰도를 높인다 */}
            <div className="mt-14 flex items-center gap-4 border-t border-black/10 pt-8">
              <Image
                src="/icon.png"
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 rounded-full"
              />
              <div>
                <p className="text-[16px] font-bold text-[#1d1d1f]">{AUTHOR_NAME}</p>
                <p className="mt-0.5 text-[14px] text-[#6e6e73]">{AUTHOR_BIO}</p>
              </div>
            </div>
          </div>
        </article>

        {/* 글 하단 CTA — 관리자 화면에서 글마다 설정. 없으면 아무것도 나오지 않는다 */}
        {item.cta && (
          <div className="mx-auto max-w-[760px] px-[18px] pb-12">
            <PostCtaBox post={item} />
          </div>
        )}

        {/* 연관 콘텐츠 — 글 본문이 아니므로 <article> 바깥에 둔다 */}
        {related.length > 0 && (
          <div className="border-t border-black/5 bg-white">
            <div className="mx-auto max-w-[1200px] px-[18px] py-12">
              <h2 className="mb-6 text-[24px] font-bold tracking-tight text-[#1d1d1f]">
                연관 콘텐츠
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/news/${r.slug}`}
                    className="block overflow-hidden rounded-[20px] bg-[#f5f5f7] shadow-sm transition hover:shadow-md"
                  >
                    {r.imageUrl ? (
                      <div className="relative h-[160px] w-full">
                        <Image
                          src={r.imageUrl}
                          alt={r.seoTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-[160px] w-full items-center justify-center bg-[#e5e5e7] text-[13px] text-[#8e8e93]">
                        사진 준비중
                      </div>
                    )}
                    <div className="p-5">
                      <p className="mb-2 text-[13px] font-medium text-[#6e6e73]">
                        {r.eyebrow}
                      </p>
                      <h3 className="text-[16px] font-bold leading-snug text-[#1d1d1f]">
                        {r.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}