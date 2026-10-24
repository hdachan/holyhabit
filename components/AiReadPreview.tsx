"use client";

import { useState } from "react";
import { SITE_NAME } from "@/lib/site";

// 내용 도우미의 "검색엔진·AI가 읽는 모습" 미리보기.
// 구글봇·네이버 예티(검색)와 ChatGPT·Claude·Perplexity(AI) 수집기가 공통으로 가져가는 글자와 구조.
// 실제 글 페이지(app/blog/[slug]/page.tsx)가 내보내는 것과 같은 순서로 보여준다:
// 제목 → 설명 → 구조 정보(작성자·분류·날짜) → 본문(소제목은 #, 목록은 -, 사진은 설명 글자로).

type Props = {
  title: string;
  description: string; // 직접 쓴 요약 또는 본문 앞부분 자동 요약
  label: string;
  authorName: string | null;
  bodyHtml: string;
  publishedAt?: string; // 수정하는 글이면 원래 발행일, 새 글이면 오늘
};

/** 본문 HTML → AI가 읽는 글자 형태. 브라우저에서만 실행한다(DOMParser). */
function bodyToAiText(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const lines: string[] = [];

  const inline = (el: Element): string =>
    Array.from(el.childNodes)
      .map((node) => {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
        if (!(node instanceof Element)) return "";
        if (node.tagName === "IMG") return imageText(node);
        if (node.tagName === "BR") return "\n";
        return inline(node);
      })
      .join("")
      .replace(/[​-‍﻿]/g, "");

  const imageText = (img: Element) => {
    const alt = img.getAttribute("alt")?.trim();
    return alt ? `[사진: ${alt}]` : "[사진: 설명 없음 — AI는 이 사진 내용을 알 수 없어요]";
  };

  for (const el of Array.from(doc.body.children)) {
    const text = inline(el).trim();
    switch (el.tagName) {
      case "H1":
      case "H2":
        if (text) lines.push("", `## ${text}`);
        break;
      case "H3":
        if (text) lines.push("", `### ${text}`);
        break;
      case "UL":
      case "OL":
        Array.from(el.children).forEach((li, i) =>
          lines.push(`${el.tagName === "OL" ? `${i + 1}.` : "-"} ${inline(li).trim()}`)
        );
        break;
      case "BLOCKQUOTE":
        if (text) lines.push(`> ${text}`);
        break;
      case "IMG":
        lines.push(imageText(el));
        break;
      case "HR":
        lines.push("---");
        break;
      default:
        if (text) lines.push(text);
    }
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export default function AiReadPreview({ title, description, label, authorName, bodyHtml, publishedAt }: Props) {
  const [open, setOpen] = useState(false);
  const oneLineTitle = title.replace(/\s+/g, " ").trim() || "제목";
  const date = (publishedAt ?? new Date().toISOString()).slice(0, 10);

  return (
    <div className="mt-5 border-t border-black/10 pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-[12px] font-medium text-[#8e8e93] hover:text-[#1d1d1f]"
      >
        <span>검색엔진·AI가 읽는 모습 미리보기</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-2">
          <p className="mb-2 text-[12px] leading-[1.5] text-[#6e6e73]">
            구글·네이버 검색엔진과 ChatGPT·Claude 같은 AI가 공통으로 가져가는 내용이에요. 디자인이
            아니라 이 글자와 구조로 글을 이해해요. 소제목(##)이 목차가 되고, 소제목이 질문의 답처럼
            쓰여 있으면 검색 결과와 AI 답변에 뽑혀 나가기 좋아요.
          </p>
          <pre className="max-h-[420px] overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-[#1d1d1f] p-3 font-mono text-[11px] leading-[1.6] text-[#e5e5e7]">
            {[
              `[제목] ${oneLineTitle} | ${SITE_NAME}`,
              `[설명] ${description || "(비어 있음)"}`,
              `[구조 정보] 블로그 글 · 작성자: ${authorName ?? "(작성자 정보 없음)"} · 분류: ${label || "(라벨 없음)"} · 발행: ${date} · 발행처: ${SITE_NAME}`,
              "",
              `# ${oneLineTitle}`,
              `${authorName ?? ""} · ${date}`,
              "",
              bodyToAiText(bodyHtml) || "(본문 없음)",
            ].join("\n")}
          </pre>
        </div>
      )}
    </div>
  );
}
