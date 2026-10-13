"use client";

import { useState } from "react";
import type { PostOption } from "@/lib/related";

// 내 글 목록에서 글을 찾아 고르는 목록 (검색 포함).
// 연관 콘텐츠 위젯과 에디터의 🔗 "내 글 고르기"가 같이 쓴다.
export default function PostPicker({
  options,
  isSelected,
  isDisabled,
  onPick,
  maxHeight = 240,
}: {
  options: PostOption[];
  isSelected?: (slug: string) => boolean;
  isDisabled?: (slug: string) => boolean;
  onPick: (option: PostOption) => void;
  maxHeight?: number;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter(
        (o) => o.title.toLowerCase().includes(q) || o.slug.includes(q)
      )
    : options;

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="제목으로 검색"
        className="mb-2 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14px] text-[#1d1d1f]"
      />
      {filtered.length === 0 ? (
        <p className="px-1 py-2 text-[13px] text-[#8e8e93]">
          {options.length === 0 ? "고를 수 있는 다른 글이 아직 없어요." : "검색 결과가 없어요."}
        </p>
      ) : (
        <ul
          className="flex flex-col gap-0.5 overflow-y-auto rounded-lg border border-black/10 bg-white p-1"
          style={{ maxHeight }}
        >
          {filtered.map((option) => {
            const selected = isSelected?.(option.slug) ?? false;
            const disabled = !selected && (isDisabled?.(option.slug) ?? false);
            return (
              <li key={option.slug}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPick(option)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[14px] ${
                    selected
                      ? "bg-[#1d1d1f] text-white"
                      : disabled
                        ? "text-[#c7c7cc]"
                        : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{option.title}</span>
                  <span
                    className={`shrink-0 font-mono text-[11px] ${selected ? "text-white/60" : "text-[#8e8e93]"}`}
                  >
                    {option.slug}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
