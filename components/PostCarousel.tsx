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
}: {
  post: Post;
  reverse: boolean;
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
            alt={post.title}
            fill
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
          <h1 className="mt-5 text-[44px] font-extrabold leading-[1.03] tracking-tight text-[#1d1d1f] md:text-[76px]">
            {post.title}
          </h1>
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
        <p className="text-[14px] text-[#6e6e73]">
          /admin 에서 첫 글을 작성해보세요.
        </p>
      </div>
    );
  }
  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;
  return (
    <section>
      {title && (
        <h2 className="mb-4 text-[22px] font-bold tracking-tight text-[#1d1d1f]">
          {title}
        </h2>
      )}
      <div className="flex flex-col gap-10">
        {visiblePosts.map((post, index) => (
          <FeaturedPost key={post.slug} post={post} reverse={index % 2 === 1} />
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