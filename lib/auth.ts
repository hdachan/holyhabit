import { createSupabaseServerClient } from "./supabase-server";

// 관리자로 인정할 이메일 목록. 환경변수 ADMIN_EMAILS에 쉼표로 구분해서 넣는다.
// 예: ADMIN_EMAILS=a@example.com,b@example.com
// Supabase에 계정이 있어도 이 목록에 없으면 관리자가 아니다.
// (회원가입이 실수로 열려 있어도 아무나 관리자가 되지 못하게 하는 이중 잠금)
function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined) {
  return !!email && getAdminEmails().includes(email.toLowerCase());
}

/** 로그인한 사용자 정보. 로그인하지 않았으면 null. */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  // getSession()은 쿠키 내용을 그대로 믿기 때문에 위조할 수 있다.
  // getUser()는 Supabase 서버에 토큰을 확인받으므로 권한 판단에는 이걸 쓴다.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * 관리자 기능(Server Action) 맨 앞에서 호출한다.
 * Server Action은 화면을 거치지 않고 직접 호출할 수 있어서,
 * 페이지만 막으면 안 되고 기능마다 확인해야 한다.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) {
    throw new Error("관리자만 사용할 수 있어요. 다시 로그인해주세요.");
  }
  return user;
}

// 슈퍼 관리자: /super(문의함·지출)를 볼 수 있는 계정. 환경변수 SUPER_ADMIN_EMAILS에 쉼표로 구분해서 넣는다.
// 문의·버그 제보에는 방문자 개인정보(이메일)가 있어서 일반 관리자(글 작성자)와 분리한다.
function getSuperAdminEmails() {
  return (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperAdminEmail(email: string | undefined) {
  return !!email && getSuperAdminEmails().includes(email.toLowerCase());
}

/** 슈퍼 관리자 기능(문의함·지출)의 Server Action과 화면 맨 앞에서 호출한다. */
export async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || !isSuperAdminEmail(user.email)) {
    throw new Error("슈퍼 관리자만 쓸 수 있어요. 다시 로그인해주세요.");
  }
  return user;
}
