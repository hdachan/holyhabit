"use client";

import { useState } from "react";
import { htmlToText, stripHtmlToExcerpt } from "@/lib/text";
import { checkAlt, extractAlts } from "@/lib/alt";
import { SITE_NAME, postPath } from "@/lib/site";

// 글쓰기 화면의 검색 노출 도우미.
// 기준은 "글 쓸 때 키워드 꿀팁" 가이드와 같다. 검사만 하고 저장을 막지는 않는다.
// - SeoChecks: 각 입력 칸(제목·주소·대표 사진·본문) 바로 아래에 그 칸의 검사 결과를 보여준다.
// - SeoHelper: 오른쪽 패널. 검색어 입력(①②), 영역별 점수, 검색 결과 미리보기.
// 항목마다 ⓘ를 누르면 이유와 예시가 펼쳐진다.

// tip: 선택 사항. 안 해도 되는 항목이라 점수에 넣지 않고, 통과 항목과 함께 접어서 보여준다.
type Status = "pass" | "warn" | "fail" | "tip";
export type CheckGroup = "title" | "slug" | "cover" | "body";
export type Check = {
  id: string;
  label: string;
  status: Status;
  detail: string;
  group: CheckGroup;
  // 본문 검사는 항목이 많아서 작은 묶음으로 한 번 더 나눈다.
  section?: string;
};
type Tip = { why: string; bad?: string; good?: string };

export type SeoInput = {
  title: string;
  slug: string;
  bodyHtml: string;
  coverImageUrl: string | null;
};

// 검사 항목이 어느 입력 칸에 속하는지
const GROUP_OF: Record<string, { group: CheckGroup; section?: string }> = {
  "title-length": { group: "title" },
  "title-keyword": { group: "title" },
  "title-number": { group: "title" },
  slug: { group: "slug" },
  cover: { group: "cover" },
  "opening-keyword": { group: "body", section: "검색어" },
  "keyword-count": { group: "body", section: "검색어" },
  related: { group: "body", section: "검색어" },
  "heading-keyword": { group: "body", section: "검색어" },
  "closing-keyword": { group: "body", section: "검색어" },
  headings: { group: "body", section: "구성" },
  "heading-density": { group: "body", section: "구성" },
  "body-length": { group: "body", section: "구성" },
  list: { group: "body", section: "구성" },
  "image-alt": { group: "body", section: "사진·링크" },
  "internal-link": { group: "body", section: "사진·링크" },
};

export const GROUP_LABEL: Record<CheckGroup, string> = {
  title: "제목",
  slug: "주소",
  cover: "대표 사진",
  body: "본문",
};

// 검색 결과 제목은 한글 약 30자에서 잘린다. 뒤에 " | holyhabit"이 붙으므로 글 제목은 25자 안쪽이 안전.
const TITLE_SAFE = 25;
const TITLE_MAX = 32;
// 검색 결과 요약문으로 실제 보이는 앞부분 길이
const SNIPPET_VISIBLE = 80;
const MIN_BODY_CHARS = 1500;
// 글 주소 규칙 (app/actions.ts의 SLUG_PATTERN과 같아야 한다)
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// 소제목 하나가 맡기 적당한 글자 수 (문단 3~5개 ≈ 500~700자)
const CHARS_PER_HEADING = 700;
// "마지막 문단"으로 볼 끝부분 길이
const CLOSING_CHARS = 200;

// ⓘ를 눌렀을 때 보여줄 설명과 예시
const TIPS: Record<string, Tip> = {
  "title-length": {
    why: "검색 결과에서 제목은 한글 약 30자에서 잘려요. 뒤에 \" | holyhabit\"이 자동으로 붙어서 글 제목은 25자 안쪽이 안전해요.",
    bad: "제가 요즘 느낀 점인데요, 함께 운동하면 확실히 오래 가더라고요",
    good: "함께 운동하면 더 오래 하는 이유 3가지",
  },
  "title-keyword": {
    why: "검색엔진과 사람 모두 제목 앞부분을 가장 먼저 읽어요. 키워드는 앞쪽에 둘수록 좋아요.",
    bad: "초보가 모르는 7가지, 헬스장 매너 총정리",
    good: "헬스장 매너 총정리: 초보가 모르는 7가지",
  },
  "title-number": {
    why: "숫자가 있으면 무엇을 얻을지 분명해져서 클릭률이 올라가요. \"초보, 방법, 이유, 총정리\"도 실제로 많이 검색하는 말이에요.",
    bad: "헬스장에서 지켜야 할 것들에 대한 이야기",
    good: "헬스장 매너 총정리: 초보가 모르는 7가지",
  },
  "opening-keyword": {
    why: "본문 맨 앞 120자가 검색 결과의 회색 요약문이 돼요. 실제로 보이는 건 약 80자라서 첫 1~2문장에 키워드와 읽을 이유를 넣어야 해요. 소제목도 글자 수에 포함돼요.",
    bad: "안녕하세요! 오늘은 날씨가 정말 좋네요. 요즘 저는...",
    good: "운동 습관이 3일을 못 가는 이유는 의지가 아니라 환경 때문입니다. 혼자 운동할 때 포기하기 쉬운 이유와 해결법을 정리했습니다.",
  },
  "keyword-count": {
    why: "제목, 첫 문장, 소제목 1~2개, 마지막 문단에 자연스럽게 3~5번이면 충분해요. 억지로 반복하면 스팸으로 판단돼요. 네이버는 특히 엄격해요.",
    bad: "운동 습관을 위한 운동 습관 만들기, 운동 습관이 중요한 이유는 운동 습관이...",
    good: "운동 습관이 3일을 못 가는 이유는... (소제목) 운동 습관을 이어가는 방법",
  },
  related: {
    why: "같은 말이 너무 자주 나오는 부분 몇 군데를 뜻이 같은 다른 말로 바꿔요. 다른 말로 검색하는 사람에게도 글이 걸리고, 반복이 줄어 글도 자연스러워져요. 단, 제목·첫 문장·소제목의 ① 검색어는 그대로 두세요. 다른 표현은 네이버 자동완성과 연관 검색어에서 찾을 수 있어요.",
    bad: "헬스장 매너를 지키는 건 중요합니다. 헬스장 매너를 모르면 눈치가 보이죠. 헬스장 매너, 어렵지 않아요.",
    good: "헬스장 매너를 지키는 건 중요합니다. 헬스장 에티켓을 모르면 눈치가 보이죠. 헬스장 예절, 어렵지 않아요.",
  },
  headings: {
    why: "검색엔진은 소제목(H2, H3)을 \"이 글의 목차\"로 읽어요. 굵은 글씨(B)는 소제목이 아니에요. 글 제목이 이미 H1이라 본문은 H2부터 써야 해요.",
    bad: "본문에 H1 사용, 또는 굵은 글씨로만 소제목 표시",
    good: "H2: 헬스 초보가 가장 많이 하는 실수\nH2: 1주차 루틴: 기구 익히기",
  },
  "heading-keyword": {
    why: "소제목에도 키워드가 자연스럽게 들어가면 검색엔진이 글의 주제를 더 확실하게 파악해요.",
    bad: "H2: 첫 번째 이야기",
    good: "H2: 헬스 루틴을 꾸준히 이어가는 방법",
  },
  "heading-density": {
    why: "문단 3~5개마다 소제목 하나가 적당해요. 소제목 없이 길게 이어지면 읽기 어렵고 검색엔진도 구조를 파악하기 어려워요.",
    good: "제목: 헬스 초보 루틴, 처음 한 달은 이렇게 하세요\nH2: 헬스 초보가 가장 많이 하는 실수\nH2: 1주차 루틴: 기구 익히기\nH2: 2~4주차 루틴: 무게보다 횟수\nH2: 헬스 루틴을 꾸준히 이어가는 방법",
  },
  "closing-keyword": {
    why: "마지막 문단에서 키워드로 내용을 한 번 더 정리하면 글의 주제가 분명해져요.",
    good: "작은 목표부터 함께 시작하면, 운동 습관은 생각보다 오래 이어집니다.",
  },
  "body-length": {
    why: "너무 짧은 글은 \"내용이 부족하다\"고 판단될 수 있어요. 다만 길이보다 질문에 대한 답이 충분한지가 더 중요해요.",
  },
  list: {
    why: "목록(•, 1. 2. 3.)을 쓰면 읽기 쉽고, 구글이 검색 결과에 목록을 요약해서 보여주기도 해요.",
    good: "헬스장 매너 7가지\n1. 사용한 기구는 제자리에\n2. 땀은 닦고 가기\n3. ...",
  },
  slug: {
    why: "주소에도 키워드가 들어가면 좋아요. 영문 소문자, 숫자, 하이픈(-)만 쓸 수 있고 한글은 안 돼요. 한글 주소는 공유할 때 %ED%97%AC...처럼 깨져 보여요. 한 번 정하면 바꾸지 마세요. 바뀌면 검색엔진이 처음부터 다시 수집해요.",
    bad: "헬스장-매너, column-006, post1",
    good: "gym-beginner-routine, exercise-habit-tips",
  },
  cover: {
    why: "대표 사진은 검색 결과 썸네일과 카톡 미리보기에 쓰여요. 없으면 기본 로고가 나가요.",
  },
  "image-alt": {
    why: "검색엔진은 사진을 볼 수 없어서 사진 설명(alt)으로 내용을 이해해요. 설명이 있어야 구글·네이버 이미지 검색에도 나와요. 한국어로, 사진에 보이는 것을 한 문장(100자 이내)으로 쓰세요. \"사진\", \"이미지\"라는 말은 빼고요. 본문의 사진을 클릭하면 에디터 위에 설명 칸이 나와요.",
    bad: "사진1, IMG_2024.png, 헬스장 매너 헬스장 매너 헬스장",
    good: "운동 후 덤벨을 제자리에 정리하는 모습",
  },
  "internal-link": {
    why: "선택 사항이에요. 글 아래 연관 콘텐츠로 다른 글과 이미 연결되지만, 문장 속 링크는 앞뒤 문맥이 있어서 검색엔진이 두 글의 관계를 더 잘 이해해요. 글자를 선택하고 🔗를 눌러 /blog/글주소(예: /blog/column-002)를 넣으면 돼요. 글 주소는 글 관리 목록에서 볼 수 있어요. 링크 글자에는 내용을 담으세요.",
    bad: "자세한 내용은 [여기를 클릭]",
    good: "헬스장에 처음 간다면 [헬스장 매너 총정리]도 함께 읽어보세요.",
  },
};

// 한글은 띄어쓰기가 들쭉날쭉해서("헬스장 매너" / "헬스장매너") 공백을 무시하고 비교한다.
// 검색엔진도 띄어쓰기가 다른 표현을 같은 말로 인식하는 경우가 많다.
function normalize(text: string) {
  return text.toLowerCase().replace(/\s/g, "");
}

function includesKeyword(text: string, keyword: string) {
  return normalize(text).includes(normalize(keyword));
}

function countOccurrences(text: string, keyword: string) {
  if (!keyword) return 0;
  return normalize(text).split(normalize(keyword)).length - 1;
}

/** 검색어(①)·다른 표현(② 쉼표 구분 문자열)을 받아 모든 검사를 실행한다. */
export function runSeoChecks(input: SeoInput, keyword: string, related: string): Check[] {
  const relatedWords = related
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);
  return runChecks(input, keyword, relatedWords).map((c) => ({
    ...c,
    ...GROUP_OF[c.id],
  }));
}

function runChecks(
  { title, slug, bodyHtml, coverImageUrl }: SeoInput,
  keyword: string,
  relatedWords: string[]
): Omit<Check, "group" | "section">[] {
  const oneLineTitle = title.replace(/\s+/g, " ").trim();
  const bodyText = htmlToText(bodyHtml);
  const bodyChars = bodyText.replace(/\s/g, "").length;
  const headings = [...bodyHtml.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/g)].map(
    (m) => htmlToText(m[1])
  );
  const h1Count = (bodyHtml.match(/<h1[\s>]/g) ?? []).length;
  const h2Count = (bodyHtml.match(/<h2[\s>]/g) ?? []).length;
  const kw = keyword.trim();
  const checks: Omit<Check, "group" | "section">[] = [];
  const add = (id: string, label: string, status: Status, detail: string) =>
    checks.push({ id, label, status, detail });

  // ── 제목
  if (!oneLineTitle) {
    add("title-length", "제목 길이", "fail", "제목을 입력하세요.");
  } else if (oneLineTitle.length <= TITLE_SAFE) {
    add("title-length", "제목 길이", "pass", `${oneLineTitle.length}자 — 검색 결과에서 잘리지 않아요.`);
  } else if (oneLineTitle.length <= TITLE_MAX) {
    add("title-length", "제목 길이", "warn", `${oneLineTitle.length}자 — 뒷부분이 잘릴 수 있어요. ${TITLE_SAFE}자 안쪽을 추천해요.`);
  } else {
    add("title-length", "제목 길이", "fail", `${oneLineTitle.length}자 — 너무 길어요. 검색 결과에서 잘려요.`);
  }

  if (kw) {
    const normTitle = normalize(oneLineTitle);
    const pos = normTitle.indexOf(normalize(kw));
    if (pos === -1) add("title-keyword", "제목에 키워드", "fail", `제목에 "${kw}"가 없어요.`);
    else if (pos <= normTitle.length / 2) add("title-keyword", "제목에 키워드", "pass", "제목 앞쪽에 키워드가 있어요.");
    else add("title-keyword", "제목에 키워드", "warn", "키워드를 제목 앞쪽으로 옮기면 더 좋아요.");
  }

  add(
    "title-number",
    "제목에 숫자",
    /\d/.test(oneLineTitle) ? "pass" : "tip",
    /\d/.test(oneLineTitle) ? "숫자가 있어요." : "\"3가지\", \"7가지\"처럼 숫자를 넣으면 클릭률이 올라가요."
  );

  // ── 키워드
  if (!kw) {
    add("keyword-count", "검색어 검사", "warn", "위 ①에 검색어를 적으면 제목·첫 문장·소제목·반복 횟수를 검사해요.");
  } else {
    const opening = bodyText.slice(0, SNIPPET_VISIBLE);
    add(
      "opening-keyword",
      "첫 문장에 키워드",
      includesKeyword(opening, kw) ? "pass" : "fail",
      includesKeyword(opening, kw)
        ? `본문 앞 ${SNIPPET_VISIBLE}자 안에 키워드가 있어요.`
        : `본문 앞 ${SNIPPET_VISIBLE}자(검색 요약문)에 키워드를 넣어주세요.`
    );

    const count = countOccurrences(bodyText, kw);
    // 1,000자당 10번 넘게 나오면 억지 반복으로 보일 수 있다.
    const perThousand = bodyChars ? (count / bodyChars) * 1000 : 0;
    if (count < 3) add("keyword-count", "키워드 반복", "warn", `본문에 ${count}번 — 자연스럽게 3~5번 정도 넣어주세요.`);
    else if (perThousand > 10) add("keyword-count", "키워드 반복", "fail", `본문에 ${count}번 — 너무 많아요. 스팸으로 보일 수 있어요.`);
    else add("keyword-count", "키워드 반복", "pass", `본문에 ${count}번 — 적당해요.`);

    if (headings.length > 0) {
      const hit = headings.some((h) => includesKeyword(h, kw));
      add(
        "heading-keyword",
        "소제목에 키워드",
        hit ? "pass" : "warn",
        hit ? "소제목에 키워드가 있어요." : "소제목 1~2개에 키워드를 자연스럽게 넣어주세요."
      );
    }

    if (bodyChars > CLOSING_CHARS) {
      const hit = includesKeyword(bodyText.slice(-CLOSING_CHARS), kw);
      add(
        "closing-keyword",
        "마지막 문단에 키워드",
        hit ? "pass" : "warn",
        hit ? "마무리에 키워드가 있어요." : "마지막 문단에서 키워드로 한 번 정리해 주세요."
      );
    }
  }

  if (relatedWords.length === 0) {
    add("related", "바꿔 쓸 다른 표현", "tip", "위 ②에 적으면 본문에 몇 번 들어갔는지 세어줘요.");
  } else {
    const missing = relatedWords.filter((w) => countOccurrences(bodyText, w) === 0);
    const summary = relatedWords.map((w) => `${w} ${countOccurrences(bodyText, w)}번`).join(", ");
    add("related", "바꿔 쓸 다른 표현", missing.length === 0 ? "pass" : "warn", missing.length === 0 ? summary : `${summary} — 반복되는 ① 검색어 몇 군데를 안 나온 말로 바꿔보세요.`);
  }

  // ── 소제목·구성
  if (h1Count > 0) add("headings", "소제목", "fail", "본문에 H1이 있어요. 글 제목이 이미 H1이라 본문은 H2부터 써주세요.");
  else if (h2Count === 0) add("headings", "소제목", "warn", "툴바의 H2로 소제목을 나눠주세요.");
  else add("headings", "소제목", "pass", `H2 소제목 ${h2Count}개`);

  if (bodyChars >= MIN_BODY_CHARS && headings.length > 0) {
    const needed = Math.floor(bodyChars / CHARS_PER_HEADING);
    add(
      "heading-density",
      "소제목 간격",
      headings.length >= needed ? "pass" : "warn",
      headings.length >= needed
        ? "글 길이에 맞게 소제목이 나뉘어 있어요."
        : `${bodyChars.toLocaleString()}자에 소제목 ${headings.length}개 — ${needed}개 이상을 추천해요.`
    );
  }

  add(
    "body-length",
    "본문 분량",
    bodyChars >= MIN_BODY_CHARS ? "pass" : "warn",
    bodyChars >= MIN_BODY_CHARS
      ? `${bodyChars.toLocaleString()}자 (공백 제외)`
      : `${bodyChars.toLocaleString()}자 — ${MIN_BODY_CHARS.toLocaleString()}자 이상을 추천해요.`
  );

  const hasList = /<(ul|ol)[\s>]/.test(bodyHtml);
  add("list", "목록 사용", hasList ? "pass" : "tip", hasList ? "목록이 있어요." : "정리할 내용이 있으면 목록(•, 1. 2. 3.)으로 써보세요.");

  // ── 주소·사진·링크
  // 저장할 때(app/actions.ts)와 같은 규칙으로 검사한다. 여기서 통과하면 저장도 통과한다.
  if (!slug) add("slug", "글 주소", "fail", "주소(slug)를 입력하세요.");
  else if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(slug)) add("slug", "글 주소", "fail", "한글은 쓸 수 없어요. 영어 단어로 바꿔주세요. 예: 헬스장 매너 → gym-etiquette");
  else if (/[^a-z0-9-]/.test(slug)) add("slug", "글 주소", "fail", "영문 소문자, 숫자, 하이픈(-)만 쓸 수 있어요. 특수문자를 지워주세요.");
  else if (!SLUG_PATTERN.test(slug)) add("slug", "글 주소", "fail", "하이픈(-)은 단어 사이에 하나씩만 쓸 수 있어요. 맨 앞·맨 뒤나 연속(--)은 안 돼요.");
  else if (/^((post|column|news|test)-?)?\d+$/.test(slug)) add("slug", "글 주소", "warn", "번호 대신 영어 키워드로 써주세요. 예: gym-beginner-routine");
  else add("slug", "글 주소", "pass", postPath(slug));

  add(
    "cover",
    "대표 사진",
    coverImageUrl ? "pass" : "warn",
    coverImageUrl ? "검색 썸네일·공유 미리보기에 쓰여요." : "없으면 기본 로고가 미리보기로 나가요."
  );

  // 본문 사진 설명(alt): 에디터의 사진 설명 칸과 같은 기준(lib/alt.ts)으로 검사
  const alts = extractAlts(bodyHtml);
  if (alts.length > 0) {
    const missing = alts.filter((a) => !a.trim()).length;
    const weak = alts.filter((a) => a.trim() && !checkAlt(a).ok).length;
    add(
      "image-alt",
      "본문 사진 설명",
      missing + weak === 0 ? "pass" : "warn",
      missing + weak === 0
        ? `사진 ${alts.length}장 모두 설명이 좋아요.`
        : [
            `사진 ${alts.length}장 중`,
            missing > 0 && `${missing}장은 설명 없음`,
            weak > 0 && `${weak}장은 설명 보완 필요`,
            "— 본문의 사진을 클릭하면 고칠 수 있어요.",
          ]
            .filter(Boolean)
            .join(" ")
    );
  }

  // 본문 속 내 글 링크는 선택 사항. 글 아래 연관 콘텐츠로 다른 글과 이미 연결되기 때문.
  const hasInternalLink = /<a[^>]+href="[^"]*\/(blog|news)\/[^"]+"/.test(bodyHtml);
  add(
    "internal-link",
    "본문 속 내 글 링크",
    hasInternalLink ? "pass" : "tip",
    hasInternalLink
      ? "본문에 내 다른 글로 가는 링크가 있어요."
      : "본문 문장 속에 관련된 내 글 링크가 있으면 더 좋아요. 글자를 선택하고 🔗를 눌러 글 주소를 넣으면 돼요."
  );

  return checks;
}

const ICON: Record<Status, string> = { pass: "✅", warn: "⚠️", fail: "❌", tip: "💡" };

/** 점수에 들어가는 항목 (선택 사항 제외) */
export function scored(checks: Check[]) {
  return checks.filter((c) => c.status !== "tip");
}

function TipBox({ tip }: { tip: Tip }) {
  return (
    <div className="mt-2 rounded-lg bg-[#f5f5f7] p-3 text-[12px] leading-[1.6] text-[#1d1d1f]">
      <p>{tip.why}</p>
      {tip.bad && (
        <p className="mt-2 whitespace-pre-line text-red-700">❌ {tip.bad}</p>
      )}
      {tip.good && (
        <p className="mt-1 whitespace-pre-line text-green-700">✅ {tip.good}</p>
      )}
    </div>
  );
}

function TipButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="설명과 예시 보기"
      aria-expanded={open}
      className={`ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
        open ? "bg-[#1d1d1f] text-white" : "bg-black/10 text-[#6e6e73] hover:bg-black/20"
      }`}
    >
      i
    </button>
  );
}


function CheckItem({
  check,
  openTip,
  onToggleTip,
}: {
  check: Check;
  openTip: string | null;
  onToggleTip: (id: string) => void;
}) {
  return (
    <li className="flex gap-2 text-[13px] leading-[1.5]">
      <span aria-hidden>{ICON[check.status]}</span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center font-semibold text-[#1d1d1f]">
          {check.label}
          {TIPS[check.id] && (
            <TipButton open={openTip === check.id} onClick={() => onToggleTip(check.id)} />
          )}
        </p>
        <p className="break-words text-[#6e6e73]">{check.detail}</p>
        {openTip === check.id && TIPS[check.id] && <TipBox tip={TIPS[check.id]} />}
      </div>
    </li>
  );
}

/**
 * 입력 칸 바로 아래에 붙는 검사 결과.
 * 고칠 것(⚠️ ❌)은 바로 보여주고, 통과한 항목(✅)은 접어둬서 화면을 가볍게 한다.
 */
export function SeoChecks({ checks }: { checks: Check[] }) {
  const [openTip, setOpenTip] = useState<string | null>(null);
  const [showPassed, setShowPassed] = useState(false);
  if (checks.length === 0) return null;

  const toggleTip = (id: string) => setOpenTip((cur) => (cur === id ? null : id));
  const todo = checks.filter((c) => c.status === "warn" || c.status === "fail");
  // 통과한 항목과 선택 사항은 접어둔다.
  const passed = checks.filter((c) => c.status === "pass");
  const tips = checks.filter((c) => c.status === "tip");
  const folded = passed.length + tips.length;
  const visible = showPassed ? checks : todo;

  // 본문처럼 묶음(section)이 있으면 묶음 이름을 달아서 보여준다.
  const sections = [...new Set(visible.map((c) => c.section ?? ""))];

  return (
    <div className="mt-2 rounded-lg border border-black/5 bg-white/70 px-3 py-2.5">
      {sections.map((section) => (
        <div key={section} className={section ? "mb-2 last:mb-0" : ""}>
          {section && (
            <p className="mb-1.5 text-[11px] font-semibold tracking-[0.04em] text-[#8e8e93]">
              {section}
            </p>
          )}
          <ul className="flex flex-col gap-2">
            {visible
              .filter((c) => (c.section ?? "") === section)
              .map((check) => (
                <CheckItem key={check.id} check={check} openTip={openTip} onToggleTip={toggleTip} />
              ))}
          </ul>
        </div>
      ))}

      {folded > 0 && (
        <button
          type="button"
          onClick={() => setShowPassed((v) => !v)}
          className={`text-[12px] font-medium text-green-700 hover:underline ${visible.length > 0 ? "mt-2" : ""}`}
        >
          {showPassed
            ? "접기"
            : [
                passed.length > 0 &&
                  (todo.length === 0 ? `✅ 모두 통과 ${passed.length}개` : `✅ 통과 ${passed.length}개`),
                tips.length > 0 && `💡 선택 ${tips.length}개`,
              ]
                .filter(Boolean)
                .join(" · ") + " 보기"}
        </button>
      )}
    </div>
  );
}

/**
 * 오른쪽 패널: 검색어 입력(①②), 영역별 점수(누르면 해당 칸으로 이동), 검색 결과 미리보기.
 * 검사 결과 자체는 각 입력 칸 아래(SeoChecks)에 나온다.
 */
export default function SeoHelper({
  input,
  checks,
  keyword,
  onKeywordChange,
  related,
  onRelatedChange,
}: {
  input: SeoInput;
  checks: Check[];
  keyword: string;
  onKeywordChange: (value: string) => void;
  related: string;
  onRelatedChange: (value: string) => void;
}) {
  // 모바일에서도 ①② 입력이 중요해서 처음엔 펼쳐 둔다.
  const [open, setOpen] = useState(true);
  const passed = checks.filter((c) => c.status === "pass").length;
  const total = scored(checks).length;
  const oneLineTitle = input.title.replace(/\s+/g, " ").trim();
  const snippet = stripHtmlToExcerpt(input.bodyHtml);

  return (
    <aside className="rounded-[16px] bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between lg:pointer-events-none"
      >
        <h2 className="text-[16px] font-bold text-[#1d1d1f]">검색 노출 도우미</h2>
        <span className="text-[14px] font-semibold text-[#1d1d1f]">
          {passed}/{total}
          <span className="ml-2 text-[#8e8e93] lg:hidden">{open ? "▲" : "▼"}</span>
        </span>
      </button>

      <div className={`${open ? "block" : "hidden"} mt-4 lg:block`}>
        {/* 쓰는 사람이 바로 이해하도록 질문 형태 이름 + 한 줄 설명 + 서로 이어지는 예시 */}
        <label className="block text-[13px] font-semibold text-[#1d1d1f]">
          ① 이 글, 어떤 검색어로 찾아오면 좋겠어요?
        </label>
        <p className="mb-1.5 mt-0.5 text-[12px] text-[#8e8e93]">
          가장 중요한 검색어 하나만 적어요.
        </p>
        <input
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="예: 헬스장 매너"
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-[14px] text-[#1d1d1f]"
        />

        <label className="mt-4 block text-[13px] font-semibold text-[#1d1d1f]">
          ② 같은 말이 반복될 때 바꿔 쓸 다른 표현{" "}
          <span className="font-normal text-[#8e8e93]">(선택)</span>
        </label>
        <p className="mb-1.5 mt-0.5 text-[12px] text-[#8e8e93]">
          같은 뜻의 다른 말을 쉼표로 적으면 본문에 몇 번 들어갔는지 세어줘요. 반복되는 부분 몇 군데를 이 말로 바꾸면 다른 검색어에도 걸려요.
        </p>
        <input
          value={related}
          onChange={(e) => onRelatedChange(e.target.value)}
          placeholder="예: 헬스장 에티켓, 헬스장 예절"
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-[14px] text-[#1d1d1f]"
        />
        <p className="mt-2 text-[12px] text-[#8e8e93]">입력값은 검사용이라 저장되지 않아요.</p>

        {/* 영역별 점수. 누르면 해당 입력 칸으로 이동한다. 자세한 결과는 각 칸 아래에 나온다. */}
        <div className="mt-5 border-t border-black/10 pt-4">
          <p className="mb-2 text-[12px] font-medium text-[#8e8e93]">
            영역별 결과 · 자세한 내용은 각 입력 칸 아래에 있어요
          </p>
          <ul className="flex flex-col gap-1">
            {(Object.keys(GROUP_LABEL) as CheckGroup[]).map((group) => {
              const items = scored(checks).filter((c) => c.group === group);
              if (items.length === 0) return null;
              const ok = items.filter((c) => c.status === "pass").length;
              const worst = items.some((c) => c.status === "fail")
                ? "fail"
                : items.some((c) => c.status === "warn")
                  ? "warn"
                  : "pass";
              return (
                <li key={group}>
                  <a
                    href={`#seo-${group}`}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-[13px] text-[#1d1d1f] hover:bg-[#f5f5f7]"
                  >
                    <span>
                      {ICON[worst]} {GROUP_LABEL[group]}
                    </span>
                    <span className="font-semibold">
                      {ok}/{items.length} →
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 실제 검색 결과에 보일 모습 (대략적인 미리보기) */}
        <div className="mt-5 border-t border-black/10 pt-4">
          <p className="mb-2 text-[12px] font-medium text-[#8e8e93]">검색 결과 미리보기</p>
          <p className="text-[12px] text-[#6e6e73]">{postPath(input.slug || "...")}</p>
          <p className="mt-0.5 line-clamp-1 text-[16px] text-[#1a0dab]">
            {oneLineTitle || "제목"} | {SITE_NAME}
          </p>
          <p className="mt-1 line-clamp-2 text-[13px] leading-[1.5] text-[#4d5156]">
            {snippet || "본문 앞부분이 요약문으로 나와요."}
          </p>
        </div>
      </div>
    </aside>
  );
}
