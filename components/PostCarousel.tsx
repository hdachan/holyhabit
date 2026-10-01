"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/posts";

const PAGE_SIZE = 4;

function PlaceholderImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#e5e5e7] text-[13px] text-[#8e8e93]">
      사진 준비중
    </div>
  );
}

function FeaturedPost({
  post,
  reverse,
  priority,
}: {
  post: Post;
  reverse: boolean;
  // 첫 화면에 보이는 첫 번째 이미지만 true.
  // 홈의 LCP(가장 큰 요소)가 이 이미지라서 lazy 대신 즉시 로드해야 로딩 점수가 좋아진다.
  priority: boolean;
}) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className={`group flex flex-col gap-8 rounded-[32px] bg-[#f5f5f7] p-4 md:flex-row md:items-stretch md:gap-16 md:p-6 ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className="relative h-[320px] w-full overflow-hidden rounded-[8px] bg-black md:h-[560px] md:w-[60%]">
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            // 줄바꿈 없는 seoTitle 사용 (이미지 검색·접근성용)
            alt={post.seoTitle}
            fill
            priority={priority}
            // 실제 표시 크기를 알려줘서 적절한 해상도의 이미지만 받게 한다.
            // 모바일은 전체 폭, 데스크톱(md 이상)은 카드의 60% 폭.
            // 없으면 기본값 100vw로 간주해 필요 이상 큰 이미지를 받는다(첫 화면 로딩 속도에 영향).
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <PlaceholderImage />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between px-2 py-2 md:py-3">
        <div>
          <p className="text-[16px] font-bold uppercase tracking-[0.12em] text-[#8e8e93]">
            {post.eyebrow}
          </p>
          {/* h1 → h2: h1은 페이지당 하나(페이지 주제)여야 한다.
              글 카드마다 h1이면 홈에 h1이 글 개수만큼 생긴다.
              크기는 class로 지정되어 있어 디자인은 그대로다. */}
          <h2 className="mt-5 text-[44px] font-extrabold leading-[1.03] tracking-tight text-[#1d1d1f] md:text-[76px]">
            {post.title}
          </h2>
        </div>
        <div className="mt-10 flex items-center gap-4 text-[18px] font-bold uppercase tracking-wide text-[#1d1d1f]">
          <span className="text-[24px] transition group-hover:translate-x-1">
            →
          </span>
          자세히 보기
        </div>
      </div>
    </Link>
  );
}

export default function PostCarousel({
  title,
  posts,
}: {
  title?: string;
  posts: Post[];
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (posts.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-[24px] bg-white text-center shadow-sm">
        <p className="text-[18px] font-semibold text-[#1d1d1f]">
          아직 등록된 글이 없어요
        </p>
        {/* 방문자에게 관리자 경로(/admin)를 노출하지 않도록 문구 변경 */}
        <p className="text-[14px] text-[#6e6e73]">
          곧 새로운 소식으로 찾아올게요.
        </p>
      </div>
    );
  }

  const hasMore = visibleCount < posts.length;

  return (
    <section>
      {title && (
        <h2 className="mb-4 text-[22px] font-bold tracking-tight text-[#1d1d1f]">
          {title}
        </h2>
      )}
      <div className="flex flex-col gap-10">
        {/* 전체 글을 HTML에 렌더링하고, visibleCount 이후는 CSS(hidden)로만 숨긴다.
            slice로 잘라내면 5번째 이후 글의 링크가 HTML에 없어서
            크롤러가 홈에서 오래된 글을 발견하지 못한다(버튼은 누르지 않으므로).
            숨겨진 이미지는 lazy loading이라 실제로 로드되지 않아 성능 영향도 없다.
            flex gap은 hidden 요소를 무시하므로 간격도 기존과 동일하다. */}
        {posts.map((post, index) => (
          <div
            key={post.slug}
            className={index >= visibleCount ? "hidden" : undefined}
          >
            <FeaturedPost
              post={post}
              reverse={index % 2 === 1}
              priority={index === 0}
            />
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="rounded-full bg-[#1d1d1f] px-6 py-3 text-[14px] font-bold text-white transition hover:opacity-80"
          >
            더보기
          </button>
        </div>
      )}
    </section>
  );
}