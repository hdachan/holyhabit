"use client";

import { MAX_CTA_POSTS, type PostCta } from "@/lib/cta";

// 글쓰기 화면 본문 아래의 "글 하단 CTA" 선택 칸.
// 없음 / 링크 버튼 / 다른 글 추천 중 하나를 고른다.

export type CtaPostOption = { slug: string; title: string };

type Props = {
  value: PostCta | null;
  onChange: (cta: PostCta | null) => void;
  // 추천할 수 있는 글 목록 (지금 쓰는 글은 빠져 있다)
  postOptions: CtaPostOption[];
};

const inputClass =
  "w-full min-w-0 rounded-lg border border-black/10 bg-white px-4 py-2 text-[14px] text-[#1d1d1f]";

export default function CtaEditor({ value, onChange, postOptions }: Props) {
  const type = value?.type ?? "none";

  function selectType(next: "none" | "link" | "posts") {
    if (next === "none") onChange(null);
    else if (next === "link")
      onChange({ type: "link", text: "", buttonText: "", url: "" });
    else
      onChange({ type: "posts", text: "이 글을 읽었다면 함께 읽어보세요", slugs: [] });
  }

  function toggleSlug(slug: string) {
    if (value?.type !== "posts") return;
    const selected = value.slugs.includes(slug);
    if (!selected && value.slugs.length >= MAX_CTA_POSTS) return;
    onChange({
      ...value,
      slugs: selected
        ? value.slugs.filter((s) => s !== slug)
        : [...value.slugs, slug],
    });
  }

  return (
    <div className="rounded-[16px] border border-black/10 bg-white p-5">
      <p className="text-sm font-medium text-[#1d1d1f]">글 하단 CTA</p>
      <p className="mb-4 mt-1 text-[12px] text-[#8e8e93]">
        글을 다 읽은 사람에게 보여줄 마지막 행동 버튼이에요. 본문 아래, 연관 콘텐츠 위에 나와요.
      </p>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["none", "없음"],
            ["link", "링크 버튼"],
            ["posts", "다른 글 추천"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => selectType(key)}
            className={`rounded-full px-4 py-1.5 text-[14px] font-medium ${
              type === key
                ? "bg-[#1d1d1f] text-white"
                : "border border-black/10 text-[#6e6e73] hover:text-[#1d1d1f]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {value?.type === "link" && (
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[13px] text-[#6e6e73]">문구</label>
            <input
              value={value.text}
              onChange={(e) => onChange({ ...value, text: e.target.value })}
              placeholder="혼자 하면 3일, 함께 하면 30일. 친구와 함께 운동 습관을 만들어 보세요."
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-[#6e6e73]">버튼 글자</label>
            <input
              value={value.buttonText}
              onChange={(e) => onChange({ ...value, buttonText: e.target.value })}
              placeholder="holyhabit 시작하기"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-[#6e6e73]">
              링크 (https:// 또는 내 사이트 주소 /...)
            </label>
            <input
              value={value.url}
              onChange={(e) => onChange({ ...value, url: e.target.value })}
              placeholder="https://..."
              className={`${inputClass} font-mono`}
            />
          </div>
        </div>
      )}

      {value?.type === "posts" && (
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[13px] text-[#6e6e73]">추천 문구</label>
            <input
              value={value.text}
              onChange={(e) => onChange({ ...value, text: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <p className="mb-1 text-[13px] text-[#6e6e73]">
              추천할 글 ({value.slugs.length}/{MAX_CTA_POSTS})
            </p>
            {postOptions.length === 0 ? (
              <p className="text-[13px] text-[#8e8e93]">추천할 다른 글이 아직 없어요.</p>
            ) : (
              <ul className="flex max-h-[240px] flex-col gap-1 overflow-y-auto rounded-lg border border-black/10 p-2">
                {postOptions.map((option) => {
                  const checked = value.slugs.includes(option.slug);
                  const disabled = !checked && value.slugs.length >= MAX_CTA_POSTS;
                  return (
                    <li key={option.slug}>
                      <label
                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[14px] ${
                          disabled ? "text-[#c7c7cc]" : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleSlug(option.slug)}
                        />
                        <span className="truncate">{option.title}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
