// 문의하기·버그 제보 규칙. 양식(화면)과 저장(app/contact/actions.ts)이 같은 기준을 쓴다.
//
// 둘 다 inquiries 표에 저장하고 kind로 구분한다.
// - 문의하기(kind = "inquiry"): 양식으로 한 번 보내고 끝. 답장은 이메일로.
// - 버그 제보(kind = "bug"): 채팅방. 방문자는 열쇠(token)로 자기 채팅방을 다시 열고, 관리자는 문의함에서 채팅으로 답한다.

export type InquiryKind = "inquiry" | "bug";

export const INQUIRY_TYPES = ["서비스 문의", "제휴·광고", "기타"] as const;
// 버그 제보는 유형을 고르지 않는다. inquiries.type에는 이 값이 들어간다.
export const BUG_TYPE = "버그 제보";

export const INQUIRY_CONTENT_MIN = 10;
export const INQUIRY_CONTENT_MAX = 2000;

// 채팅 메시지 하나의 최대 길이. 첫 제보는 INQUIRY_CONTENT_MIN 이상이어야 하지만, 이어 보내는 메시지는 짧아도 된다.
export const MESSAGE_MAX = INQUIRY_CONTENT_MAX;

/** 버그 제보 채팅방의 메시지. user = 방문자, admin = 관리자(holyhabit) */
export type ChatMessage = {
  id: number;
  sender: "user" | "admin";
  body: string;
  createdAt: string;
};

/**
 * 새 메시지 확인 결과. closed = 관리자가 해결 완료로 닫음(inquiries.status = "done").
 * 닫힌 채팅방은 남아 있지만 방문자도 관리자도 메시지를 보낼 수 없고, 관리자가 "다시 열기"를 누르면 이어진다.
 */
export type ChatPoll = { messages: ChatMessage[]; closed: boolean };

/** 방문자의 "내 버그 제보" 목록 한 줄 */
export type BugThreadSummary = {
  token: string;
  closed: boolean;
  createdAt: string;
  lastMessageAt: string;
  // 첫 메시지(제보 내용)
  preview: string;
  // 관리자가 마지막으로 답했는지 ("새 답변" 표시용)
  answered: boolean;
};

export const BUG_CLOSED_NOTICE = "해결 완료된 제보예요. 다른 문제가 있으면 새 버그 제보를 남겨주세요.";

// 대화방 열쇠(token)는 Supabase가 만드는 무작위 UUID다. 이 형식이 아니면 DB를 조회하지 않는다.
const TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isInquiryToken(value: unknown): value is string {
  return typeof value === "string" && TOKEN_PATTERN.test(value);
}

/**
 * 새 메시지를 확인하는 간격. 대화가 오가는 중에는 빠르게, 조용해지면 점점 느리게 확인해서
 * 화면을 켜 두고 잊어버려도 호출이 많이 쌓이지 않게 한다.
 */
export function pollDelay(msSinceActivity: number) {
  if (msSinceActivity < 60_000) return 5_000; // 1분 안: 5초마다
  if (msSinceActivity < 5 * 60_000) return 30_000; // 5분 안: 30초마다
  return 60_000; // 그 뒤: 1분마다
}

export type InquiryInput = {
  type: string;
  email: string;
  content: string;
  agreed: boolean;
};

export type BugInput = {
  // 선택: 비워도 된다
  email: string;
  content: string;
  agreed: boolean;
};

// 흔한 형식만 확인한다 (예: name@example.com). 실제 존재 여부는 답장해야 알 수 있다.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function isEmail(email: string) {
  return EMAIL_PATTERN.test(email.trim()) && email.trim().length <= 200;
}

function checkContent(content: string, label: string) {
  const length = content.trim().length;
  if (length < INQUIRY_CONTENT_MIN) return `${label}을 ${INQUIRY_CONTENT_MIN}자 이상 써주세요.`;
  if (length > INQUIRY_CONTENT_MAX) return `${label}은 ${INQUIRY_CONTENT_MAX}자까지 쓸 수 있어요.`;
  return null;
}

/** 문의하기 입력값 검사. 문제가 있으면 안내 문장, 없으면 null. */
export function checkInquiry({ type, email, content, agreed }: InquiryInput): string | null {
  if (!(INQUIRY_TYPES as readonly string[]).includes(type)) return "문의 유형을 골라주세요.";
  if (!isEmail(email)) return "답장받을 이메일 주소를 확인해주세요. (예: name@example.com)";
  const problem = checkContent(content, "문의 내용");
  if (problem) return problem;
  if (!agreed) return "개인정보 수집·이용에 동의해주세요.";
  return null;
}

/** 버그 제보 입력값 검사. 이메일은 선택이지만, 적었다면 형식을 확인한다. */
export function checkBug({ email, content, agreed }: BugInput): string | null {
  const problem = checkContent(content, "제보 내용");
  if (problem) return problem;
  if (email.trim() && !isEmail(email)) return "이메일 주소를 확인해주세요. 적지 않아도 괜찮아요.";
  if (!agreed) return "개인정보 수집·이용에 동의해주세요.";
  return null;
}
