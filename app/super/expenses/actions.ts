"use server";

import { requireSuperAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { cleanLedgerMonth, isMonthKey, type LedgerBook } from "@/lib/expense";

/**
 * 가계부 한 달치 저장. 화면에서 고칠 때마다 (잠깐 기다렸다가) 그 달 전체를 덮어쓴다.
 * 가계부 표(ledger_months)는 RLS로 막혀 있고, 슈퍼 관리자만 이 기능으로 읽고 쓴다.
 */
export async function saveLedgerMonth(book: LedgerBook, month: string, data: unknown): Promise<{ ok: true } | { error: string }> {
  await requireSuperAdmin();
  if (book !== "personal" && book !== "company") return { error: "잘못된 가계부예요." };
  if (!isMonthKey(month)) return { error: "잘못된 달이에요." };
  const clean = cleanLedgerMonth(month, data);
  if (!clean) return { error: "저장할 내용의 형식이 맞지 않아요. 새로고침 후 다시 시도해주세요." };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("ledger_months").upsert({
    book,
    month,
    income: clean.income,
    fixed: clean.fixed,
    days: clean.days,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error("가계부 저장 실패:", error.message);
    return { error: "저장하지 못했어요. 잠시 후 다시 시도해주세요." };
  }
  return { ok: true };
}
