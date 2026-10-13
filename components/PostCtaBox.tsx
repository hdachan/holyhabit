import type { Post } from "@/lib/posts";
import CtaLinkButton from "@/components/CtaLinkButton";

// 글 하단 CTA 박스(링크 버튼). 글 페이지에서 본문 아래, 연관 콘텐츠 위에 나온다.
export default function PostCtaBox({ post }: { post: Post }) {
  const cta = post.cta;
  if (!cta) return null;

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
