"use client";

import type { PostCta } from "@/lib/cta";

// 글쓰기 화면 본문 아래의 "글 하단 CTA" 선택 칸. 없음 / 링크 버튼 중 하나를 고른다.
// (다른 글 추천은 "연관 콘텐츠" 위젯(RelatedPostsEditor)으로 분리했다)

type Props = {
  value: PostCta | null;
  onChange: (cta: PostCta | null) => void;
};

const inputClass =
  "w-full min-w-0 rounded-lg border border-black/10 bg-white px-4 py-2 text-[14px] text-[#1d1d1f]";

export default function CtaEditor({ value, onChange }: Props) {
  const type = value ? "link" : "none";

  function selectType(next: "none" | "link") {
    if (next === "none") onChange(null);
    else if (!value) onChange({ type: "link", text: "", buttonText: "", url: "" });
  }

  return (
    <div className="rounded-[16px] border border-black/10 bg-white p-5">
      <p className="text-sm font-medium text-[#1d1d1f]">
        글 하단 CTA <span className="font-normal text-[#8e8e93]">(선택)</span>
      </p>
      <p className="mb-4 mt-1 text-[12px] text-[#8e8e93]">
        글을 다 읽은 사람에게 보여줄 행동 버튼이에요. 앱 다운로드, 사전 신청, SNS처럼 보내고 싶은 곳이 있을 때 써요.
        본문 아래, 연관 콘텐츠 위에 나와요.
      </p>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["none", "없음"],
            ["link", "링크 버튼"],
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

      {value && (
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
    </div>
  );
}
