"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/posts";
import { POST_LABELS } from "@/lib/labels";
import { postPath } from "@/lib/site";

const PAGE_SIZE = 8;

// 글 목록 카드: 대표 사진 → 제목 → 요약 한 줄 → 라벨
function PostCard({ post, priority }: { post: Post; priority: boolean }) {
  return (
    <Link href={postPath(post.slug)} className="group block">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-[#f2f3f6]">
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={post.seoTitle}
            fill
            // 첫 화면 첫 카드만 바로 받는다 (첫 화면 로딩 점수)
            priority={priority}
            // 넓은 화면은 2열(최대 약 540px), 모바일은 화면 전체 폭
            sizes="(min-width: 768px) 540px, 100vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[14px] text-[#8e8e93]">
            사진 준비중
          </div>
        )}
      </div>
      <div className="px-2 pt-5">
        {/* 카드 제목은 h2: h1은 페이지 제목("모든 콘텐츠") 하나만 둔다 */}
        <h2 className="text-[20px] font-bold leading-[1.45] text-[#212124] group-hover:underline md:text-[22px]">
          {post.seoTitle}
        </h2>
        {post.excerpt && (
          <p className="mt-2 line-clamp-1 text-[16px] text-[#868b94]">{post.excerpt}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-[6px] border border-[#dcdee3] px-2 py-1 text-[12px] text-[#4d5159]">
            {post.eyebrow}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PostGrid({ posts }: { posts: Post[] }) {
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const q = query.trim().toLowerCase();
  const filtered = posts.filter(
    (p) =>
      (!category || p.eyebrow === category) &&
      (!q || p.seoTitle.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q))
  );
  const hasMore = visibleCount < filtered.length;

  return (
    <section>
      {/* 카테고리 · 검색 */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative sm:w-[160px]">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            aria-label="카테고리"
            className="h-[46px] w-full appearance-none rounded-[10px] border border-[#dcdee3] bg-white pl-4 pr-10 text-[15px] font-semibold text-[#212124] focus:border-[#212124] focus:outline-none"
          >
            <option value="">카테고리</option>
            {POST_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#212124]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
        <div className="relative sm:w-[360px]">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="검색"
            aria-label="콘텐츠 검색"
            className="h-[46px] w-full rounded-[10px] border border-[#dcdee3] bg-white pl-4 pr-11 text-[15px] text-[#212124] placeholder:text-[#adb1ba] focus:border-[#212124] focus:outline-none"
          />
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#212124]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-[16px] text-[#868b94]">
          {posts.length === 0 ? "곧 새로운 이야기로 찾아올게요." : "찾는 콘텐츠가 없어요."}
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-x-9 gap-y-14 md:grid-cols-2">
          {/* 전체 글을 HTML에 넣고 visibleCount 이후는 CSS(hidden)로만 숨긴다.
              잘라내면 오래된 글의 링크가 HTML에 없어서 검색엔진이 발견하지 못한다. */}
          {filtered.map((post, index) => (
            <div key={post.slug} className={index >= visibleCount ? "hidden" : undefined}>
              <PostCard post={post} priority={index === 0} />
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="rounded-[10px] bg-[#f2f3f6] px-6 py-3 text-[15px] font-semibold text-[#212124] transition hover:bg-[#e9ebee]"
          >
            더보기
          </button>
        </div>
      )}
    </section>
  );
}
