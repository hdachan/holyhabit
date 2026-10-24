"use server";

import { createSupabaseAdminClient } from "@/lib/supabase";
import { checkInquiry, type InquiryInput } from "@/lib/inquiry";

// 같은 이메일로 짧은 시간에 여러 번 보내는 것(도배·스팸)을 막는다.
const RATE_WINDOW_MINUTES = 10;
const RATE_LIMIT = 3;
// 사람이 양식을 읽고 쓰는 데 최소한 걸리는 시간. 이보다 빠르면 프로그램이 자동으로 보낸 것으로 본다.
const MIN_FILL_MS = 3000;

type SubmitInput = InquiryInput & {
  // 화면에 보이지 않는 칸. 사람은 비워 두고, 자동 스팸 프로그램은 채운다.
  website: string;
  // 양식을 연 시각 (밀리초)
  openedAt: number;
};

/**
 * 문의 저장. 로그인 없이 누구나 호출할 수 있는 기능이라
 * 입력값을 서버에서 다시 검사하고, 스팸을 걸러낸 뒤에만 저장한다.
 * 문의 표(inquiries)는 방문자가 읽을 수 없고(RLS), 관리자 화면에서만 본다.
 */
export async function submitInquiry(input: SubmitInput): Promise<{ ok: true } | { error: string }> {
  // 스팸으로 보이면 저장하지 않지만, 프로그램이 눈치채지 못하게 성공처럼 응답한다.
  if (input.website || Date.now() - input.openedAt < MIN_FILL_MS) return { ok: true };

  const problem = checkInquiry(input);
  if (problem) return { error: problem };

  const email = input.email.trim().toLowerCase();
  const supabase = createSupabaseAdminClient();

  const since = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);
  if ((count ?? 0) >= RATE_LIMIT) {
    return { error: "짧은 시간에 문의가 여러 번 접수됐어요. 잠시 후 다시 보내주세요." };
  }

  const { error } = await supabase.from("inquiries").insert({
    type: input.type,
    email,
    content: input.content.trim(),
  });
  if (error) {
    console.error("문의 저장 실패:", error.message);
    return { error: "문의를 보내지 못했어요. 잠시 후 다시 시도해주세요." };
  }
  return { ok: true };
}
