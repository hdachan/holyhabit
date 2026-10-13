"use client";

import { requiredRelatedCount, type PostOption } from "@/lib/related";
import PostPicker from "@/components/PostPicker";

// 연관 콘텐츠(필수) 선택 위젯. 글쓰기 화면 CTA 아래에 있다.
// 고른 순서대로 글 페이지 맨 아래 "연관 콘텐츠"에 나온다.
export default function RelatedPostsEditor({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (slugs: string[]) => void;
  // 고를 수 있는 글 (지금 쓰는 글은 빠져 있다)
  options: PostOption[];
}) {
  const required = requiredRelatedCount(options.length);
  const done = value.length === required;
  const titleOf = (slug: string) => options.find((o) => o.slug === slug)?.title ?? slug;

  function toggle(option: PostOption) {
    if (value.includes(option.slug)) {
      onChange(value.filter((s) => s !== option.slug));
    } else if (value.length < required) {
      onChange([...value, option.slug]);
    }
  }

  function move(index: number, delta: number) {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div
      id="related-posts"
      className={`scroll-mt-6 rounded-[16px] border bg-white p-5 ${done ? "border-black/10" : "border-amber-400"}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#1d1d1f]">
          연관 콘텐츠 <span className="text-red-600">(필수)</span>
        </p>
        <span className={`text-[13px] font-semibold ${done ? "text-green-700" : "text-amber-700"}`}>
          {value.length}/{required}
        </span>
      </div>
      <p className="mb-4 mt-1 text-[12px] text-[#8e8e93]">
        글 맨 아래 &quot;연관 콘텐츠&quot;에 보여줄 글을 {required}개 골라요. 이 글을 읽은 사람이
        이어서 읽으면 좋은 글로 고르세요. {required}개를 고르지 않으면 게시할 수 없어요.
      </p>

      {/* 고른 글 (순서대로 표시된다) */}
      {value.length > 0 && (
        <ol className="mb-4 flex flex-col gap-1.5">
          {value.map((slug, i) => (
            <li
              key={slug}
              className="flex items-center gap-2 rounded-lg bg-[#f5f5f7] px-3 py-2 text-[14px] text-[#1d1d1f]"
            >
              <span className="w-4 shrink-0 text-[12px] font-semibold text-[#8e8e93]">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate">{titleOf(slug)}</span>
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="위로"
                className="px-1 text-[#6e6e73] hover:text-[#1d1d1f] disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                aria-label="아래로"
                className="px-1 text-[#6e6e73] hover:text-[#1d1d1f] disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onChange(value.filter((s) => s !== slug))}
                aria-label="빼기"
                className="px-1 text-[#6e6e73] hover:text-red-600"
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
      )}

      {!done && (
        <PostPicker
          options={options}
          isSelected={(slug) => value.includes(slug)}
          isDisabled={() => value.length >= required}
          onPick={toggle}
        />
      )}
    </div>
  );
}
