"use server";

import { requireSuperAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { cleanLedgerMonth, isMonthKey, type LedgerBook } from "@/lib/expense";

export type SaveLedgerResult =
  | { ok: true; updatedAt: string }
  // 화면을 연 뒤 다른 기기(휴대폰·다른 창)에서 이 달이 바뀜 → 덮어쓰지 않는다
  | { conflict: true }
  | { error: string };

/**
 * 가계부 한 달치 저장. 화면에서 고칠 때마다 (잠깐 기다렸다가) 그 달 전체를 덮어쓴다.
 * 덮어쓰기 전에 "화면이 마지막으로 본 버전(updated_at)"과 DB의 버전이 같은지 확인해서,
 * 다른 기기에서 먼저 저장한 내용을 지우지 않게 한다.
 *   expectedUpdatedAt = null → 화면은 이 달이 비어 있다고 알고 있음 (새로 만들기)
 * 가계부 표(ledger_months)는 RLS로 막혀 있고, 슈퍼 관리자만 이 기능으로 읽고 쓴다.
 */
export async function saveLedgerMonth(
  book: LedgerBook,
  month: string,
  data: unknown,
  expectedUpdatedAt: string | null
): Promise<SaveLedgerResult> {
  await requireSuperAdmin();
  if (book !== "personal" && book !== "company") return { error: "잘못된 가계부예요." };
  if (!isMonthKey(month)) return { error: "잘못된 달이에요." };
  const clean = cleanLedgerMonth(month, data);
  if (!clean) return { error: "저장할 내용의 형식이 맞지 않아요. 새로고침 후 다시 시도해주세요." };

  const supabase = createSupabaseAdminClient();
  const row = { income: clean.income, fixed: clean.fixed, days: clean.days, updated_at: new Date().toISOString() };

  if (expectedUpdatedAt === null) {
    // 새로 만들기: 그사이 다른 기기에서 먼저 만들었으면 같은 키(book, month)가 있어서 실패한다.
    const { data: inserted, error } = await supabase
      .from("ledger_months")
      .insert({ book, month, ...row })
      .select("updated_at")
      .single();
    if (error?.code === "23505") return { conflict: true };
    if (error || !inserted) {
      console.error("가계부 저장 실패:", error?.message);
      return { error: "저장하지 못했어요. 잠시 후 다시 시도해주세요." };
    }
    return { ok: true, updatedAt: inserted.updated_at };
  }

  // 고치기: 화면이 본 버전 그대로일 때만 바꾼다. 바뀐 줄이 없으면 다른 기기에서 먼저 고친 것.
  const { data: updated, error } = await supabase
    .from("ledger_months")
    .update(row)
    .eq("book", book)
    .eq("month", month)
    .eq("updated_at", expectedUpdatedAt)
    .select("updated_at");
  if (error) {
    console.error("가계부 저장 실패:", error.message);
    return { error: "저장하지 못했어요. 잠시 후 다시 시도해주세요." };
  }
  if (!updated || updated.length === 0) return { conflict: true };
  return { ok: true, updatedAt: updated[0].updated_at };
}
