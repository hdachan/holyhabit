// 문의하기 규칙. 문의 양식(화면)과 저장(app/contact/actions.ts)이 같은 기준을 쓴다.

export const INQUIRY_TYPES = ["서비스 문의", "제휴·광고", "오류 신고", "기타"] as const;

export const INQUIRY_CONTENT_MIN = 10;
export const INQUIRY_CONTENT_MAX = 2000;

export type InquiryInput = {
  type: string;
  email: string;
  content: string;
  agreed: boolean;
};

// 흔한 형식만 확인한다 (예: name@example.com). 실제 존재 여부는 답장해야 알 수 있다.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** 입력값 검사. 문제가 있으면 안내 문장, 없으면 null. */
export function checkInquiry({ type, email, content, agreed }: InquiryInput): string | null {
  if (!(INQUIRY_TYPES as readonly string[]).includes(type)) return "문의 유형을 골라주세요.";
  if (!EMAIL_PATTERN.test(email.trim()) || email.trim().length > 200) {
    return "답장받을 이메일 주소를 확인해주세요. (예: name@example.com)";
  }
  const length = content.trim().length;
  if (length < INQUIRY_CONTENT_MIN) return `문의 내용을 ${INQUIRY_CONTENT_MIN}자 이상 써주세요.`;
  if (length > INQUIRY_CONTENT_MAX) return `문의 내용은 ${INQUIRY_CONTENT_MAX}자까지 쓸 수 있어요.`;
  if (!agreed) return "개인정보 수집·이용에 동의해주세요.";
  return null;
}
