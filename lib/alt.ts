// 본문 사진 설명(alt) 검사 규칙.
// 에디터의 사진 설명 칸과 검색 노출 도우미가 같은 기준을 쓴다.

export type AltCheck = { ok: boolean; message: string };

const MIN_LENGTH = 5;
const MAX_LENGTH = 100;

export function checkAlt(alt: string): AltCheck {
  const text = alt.trim();

  if (!text) {
    return { ok: false, message: "설명이 없으면 이미지 검색에 나오지 않아요." };
  }
  // 카메라·캡처 파일 이름이 그대로 들어간 경우
  if (/\.(png|jpe?g|webp|gif|heic)$/i.test(text) || /^(img|dsc|image|screenshot|kakaotalk)[_\-\s]?\d+/i.test(text)) {
    return { ok: false, message: "파일 이름 대신 사진에 보이는 내용을 적어주세요." };
  }
  // 화면 낭독기가 이미 "이미지"라고 읽어줘서 같은 말이 반복된다.
  if (/^(사진|이미지|그림)\s*(\d+)?$/.test(text) || /^(사진|이미지|그림)[:\s]/.test(text)) {
    return { ok: false, message: "\"사진\", \"이미지\"라는 말은 빼고 내용만 적어주세요." };
  }
  if (text.length < MIN_LENGTH) {
    return { ok: false, message: "조금 더 구체적으로 적어주세요. 무엇이, 어디에, 어떤 모습인지." };
  }
  if (text.length > MAX_LENGTH) {
    return { ok: false, message: `${text.length}자 — ${MAX_LENGTH}자 안쪽으로 짧게 줄여주세요.` };
  }
  return { ok: true, message: "좋아요." };
}

/** 본문 HTML의 사진 설명 목록 (설명이 없으면 빈 문자열) */
export function extractAlts(html: string) {
  return (html.match(/<img[^>]*>/g) ?? []).map(
    (img) => img.match(/\salt="([^"]*)"/)?.[1] ?? ""
  );
}
