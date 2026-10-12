import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/posts";
import CtaLinkButton from "@/components/CtaLinkButton";

// 글 하단 CTA 박스. 글 페이지에서 본문 아래, 연관 콘텐츠 위에 나온다.
export default function PostCtaBox({
  post,
  allPosts,
}: {
  post: Post;
  allPosts: Post[];
}) {
  const cta = post.cta;
  if (!cta) return null;

  if (cta.type === "link") {
    return (
      <aside className="flex flex-col items-start gap-5 rounded-[24px] bg-[#1d1d1f] p-7 md:flex-row md:items-center md:justify-between md:p-9">
        {cta.text && (
          <p className="whitespace-pre-line text-[18px] font-bold leading-[1.5] text-white md:text-[20px]">
            {cta.text}
          </p>
        )}
        <CtaLinkButton href={cta.url} label={cta.buttonText} postSlug={post.slug} />
      </aside>
    );
  }

  // 추천 글: 저장된 순서대로, 지워진 글은 건너뛴다.
  const picks = cta.slugs
    .map((slug) => allPosts.find((p) => p.slug === slug))
    .filter((p): p is Post => !!p && p.slug !== post.slug);
  if (picks.length === 0) return null;

  return (
    <aside className="rounded-[24px] bg-white p-7 shadow-sm md:p-9">
      {cta.text && (
        <p className="mb-5 text-[18px] font-bold text-[#1d1d1f] md:text-[20px]">
          {cta.text}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {picks.map((p) => (
          <Link
            key={p.slug}
            href={`/news/${p.slug}`}
            className="flex gap-3 rounded-[16px] bg-[#f5f5f7] p-3 transition hover:bg-[#ececef]"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#e5e5e7]">
              {p.imageUrl && (
                <Image src={p.imageUrl} alt={p.seoTitle} fill className="object-cover" />
              )}
            </div>
            <p className="line-clamp-3 text-[14px] font-semibold leading-[1.4] text-[#1d1d1f]">
              {p.seoTitle}
            </p>
          </Link>
        ))}
      </div>
    </aside>
  );
}
