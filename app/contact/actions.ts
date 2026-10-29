"use server";

import { createSupabaseAdminClient } from "@/lib/supabase";
import {
  BUG_CLOSED_NOTICE,
  BUG_TYPE,
  MESSAGE_MAX,
  checkBug,
  checkInquiry,
  isInquiryToken,
  type BugInput,
  type BugThreadSummary,
  type ChatMessage,
  type ChatPoll,
  type InquiryInput,
} from "@/lib/inquiry";

// 같은 이메일로 짧은 시간에 여러 번 보내는 것(도배·스팸)을 막는다.
const RATE_WINDOW_MINUTES = 10;
const RATE_LIMIT = 3;
// 버그 제보는 이메일이 선택이라, 10분 동안 사이트 전체에서 새로 만들 수 있는 채팅방 수로 막는다.
const BUG_SITE_RATE_LIMIT = 30;
// 한 채팅방에서 10분 동안 방문자가 보낼 수 있는 메시지 수
const MESSAGE_RATE_LIMIT = 20;
// "내 버그 제보" 목록을 한 번에 불러오는 최대 개수
const MAX_THREADS = 20;
// 사람이 양식을 읽고 쓰는 데 최소한 걸리는 시간. 이보다 빠르면 프로그램이 자동으로 보낸 것으로 본다.
const MIN_FILL_MS = 3000;

/*
 * 로그인 없이 쓰는 기능이라 입력값을 서버에서 다시 검사하고, 스팸을 걸러낸 뒤에만 저장한다.
 * 버그 제보 방문자는 제보할 때 받은 "채팅방 열쇠(token)"로 자기 채팅방만 연다.
 * 열쇠는 방문자 브라우저에만 저장되고, 이 파일의 기능들이 열쇠를 확인한 뒤에만 DB를 읽고 쓴다.
 * 문의 표(inquiries, inquiry_messages)는 방문자가 직접 읽거나 쓸 수 없다(RLS, 정책 없음).
 */

type SpamGuard = {
  // 화면에 보이지 않는 칸. 사람은 비워 두고, 자동 스팸 프로그램은 채운다.
  website: string;
  // 양식을 연 시각 (밀리초)
  openedAt: number;
};

const SAVE_FAILED = "보내지 못했어요. 잠시 후 다시 시도해주세요.";

function isSpam({ website, openedAt }: SpamGuard) {
  return !!website || Date.now() - openedAt < MIN_FILL_MS;
}

function since() {
  return new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000).toISOString();
}

function toMessage(row: { id: number; sender: string; body: string; created_at: string }): ChatMessage {
  return {
    id: row.id,
    sender: row.sender === "admin" ? "admin" : "user",
    body: row.body,
    createdAt: row.created_at,
  };
}

/** 문의(또는 버그 제보)를 만들고 첫 메시지로 저장한다. 실패하면 null */
async function createInquiry(row: { kind: "inquiry" | "bug"; type: string; email: string | null; content: string }) {
  const supabase = createSupabaseAdminClient();
  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .insert({ ...row, source: "web" })
    .select("id, token")
    .single();
  if (error || !inquiry) {
    console.error("문의 저장 실패:", error?.message);
    return null;
  }
  const { error: messageError } = await supabase
    .from("inquiry_messages")
    .insert({ inquiry_id: inquiry.id, sender: "user", body: row.content });
  if (messageError) {
    // 첫 메시지가 없는 빈 문의가 남지 않게 지운다.
    console.error("문의 메시지 저장 실패:", messageError.message);
    await supabase.from("inquiries").delete().eq("id", inquiry.id);
    return null;
  }
  return inquiry;
}

/** 문의하기: 양식으로 한 번 보내고 끝. 답장은 이메일로 한다. */
export async function submitInquiry(input: InquiryInput & SpamGuard): Promise<{ ok: true } | { error: string }> {
  // 스팸으로 보이면 저장하지 않지만, 프로그램이 눈치채지 못하게 성공처럼 응답한다.
  if (isSpam(input)) return { ok: true };

  const problem = checkInquiry(input);
  if (problem) return { error: problem };

  const email = input.email.trim().toLowerCase();
  const supabase = createSupabaseAdminClient();
  const { count } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since());
  if ((count ?? 0) >= RATE_LIMIT) {
    return { error: "짧은 시간에 문의가 여러 번 접수됐어요. 잠시 후 다시 보내주세요." };
  }

  const created = await createInquiry({ kind: "inquiry", type: input.type, email, content: input.content.trim() });
  return created ? { ok: true } : { error: "문의를 보내지 못했어요. 잠시 후 다시 시도해주세요." };
}

/**
 * 버그 제보: 채팅방을 만들고 열쇠를 돌려준다.
 * token이 null이면 스팸으로 걸러진 것(프로그램이 눈치채지 못하게 성공처럼 응답한다).
 */
export async function submitBugReport(
  input: BugInput & SpamGuard
): Promise<{ ok: true; token: string | null } | { error: string }> {
  if (isSpam(input)) return { ok: true, token: null };

  const problem = checkBug(input);
  if (problem) return { error: problem };

  const email = input.email.trim().toLowerCase() || null;
  const supabase = createSupabaseAdminClient();
  const recent = supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("kind", "bug")
    .gte("created_at", since());
  const { count } = await (email ? recent.eq("email", email) : recent);
  if ((count ?? 0) >= (email ? RATE_LIMIT : BUG_SITE_RATE_LIMIT)) {
    return { error: "짧은 시간에 제보가 여러 번 접수됐어요. 잠시 후 다시 보내주세요." };
  }

  const created = await createInquiry({ kind: "bug", type: BUG_TYPE, email, content: input.content.trim() });
  return created ? { ok: true, token: created.token } : { error: "제보를 보내지 못했어요. 잠시 후 다시 시도해주세요." };
}

/** 열쇠로 버그 제보 채팅방 찾기. 없거나(삭제됨) 열쇠 형식이 틀리면 null */
async function findBugThread(token: unknown) {
  if (!isInquiryToken(token)) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("inquiries")
    .select("id, status")
    .eq("token", token)
    .eq("kind", "bug")
    .maybeSingle();
  return data;
}

/** "내 버그 제보" 목록. 삭제된 채팅방은 빠진다. 최근 대화 순 */
export async function getBugThreads(tokens: string[]): Promise<BugThreadSummary[]> {
  const valid = (Array.isArray(tokens) ? tokens : []).filter(isInquiryToken).slice(0, MAX_THREADS);
  if (valid.length === 0) return [];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("inquiries")
    .select("token, status, content, created_at, last_message_at, last_sender")
    .eq("kind", "bug")
    .in("token", valid)
    .order("last_message_at", { ascending: false });
  return (data ?? []).map((row) => ({
    token: row.token,
    closed: row.status === "done",
    createdAt: row.created_at,
    lastMessageAt: row.last_message_at,
    preview: row.content,
    answered: row.last_sender === "admin",
  }));
}

/** 채팅방 열기: 지금까지의 메시지와 해결 완료 여부. 채팅방이 없으면 null */
export async function getBugThread(token: string): Promise<ChatPoll | null> {
  return getBugMessages(token, 0);
}

/** 새 메시지 확인: afterId보다 나중 메시지와 해결 완료 여부. 채팅방이 삭제됐으면 null */
export async function getBugMessages(token: string, afterId: number): Promise<ChatPoll | null> {
  const thread = await findBugThread(token);
  if (!thread) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("inquiry_messages")
    .select("id, sender, body, created_at")
    .eq("inquiry_id", thread.id)
    .gt("id", Number(afterId) || 0)
    .order("id");
  return { messages: (data ?? []).map(toMessage), closed: thread.status === "done" };
}

/** 방문자가 채팅방에 이어서 메시지 보내기 */
export async function sendBugMessage(
  token: string,
  body: string
): Promise<{ message: ChatMessage } | { error: string }> {
  const text = typeof body === "string" ? body.trim() : "";
  if (!text) return { error: "메시지를 입력해주세요." };
  if (text.length > MESSAGE_MAX) return { error: `메시지는 ${MESSAGE_MAX}자까지 보낼 수 있어요.` };

  const thread = await findBugThread(token);
  if (!thread) return { error: "채팅방을 찾을 수 없어요. 새로 제보해주세요." };
  if (thread.status === "done") return { error: BUG_CLOSED_NOTICE };

  const supabase = createSupabaseAdminClient();
  const { count } = await supabase
    .from("inquiry_messages")
    .select("id", { count: "exact", head: true })
    .eq("inquiry_id", thread.id)
    .eq("sender", "user")
    .gte("created_at", since());
  if ((count ?? 0) >= MESSAGE_RATE_LIMIT) {
    return { error: "메시지를 너무 많이 보냈어요. 잠시 후 다시 보내주세요." };
  }

  const { data, error } = await supabase
    .from("inquiry_messages")
    .insert({ inquiry_id: thread.id, sender: "user", body: text })
    .select("id, sender, body, created_at")
    .single();
  if (error || !data) {
    console.error("버그 제보 메시지 저장 실패:", error?.message);
    return { error: SAVE_FAILED };
  }

  // 문의함 목록 정렬·"답장 기다리는 중" 표시용
  await supabase
    .from("inquiries")
    .update({ last_message_at: data.created_at, last_sender: "user" })
    .eq("id", thread.id);

  return { message: toMessage(data) };
}
