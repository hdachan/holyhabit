import { createSupabaseAdminClient } from "./supabase";

/** 문의함에서 확인이 필요한 수: 새 문의 + 답장을 기다리는 버그 제보. 슈퍼 관리자 화면에서만 쓴다. */
export async function countWaitingInquiries() {
  const { count } = await createSupabaseAdminClient()
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new")
    .or("kind.eq.inquiry,last_sender.eq.user");
  return count ?? 0;
}
