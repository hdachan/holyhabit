import { requireSuperAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import ExpenseLedger from "@/components/ExpenseLedger";
import { cleanLedgerMonth, type LedgerMonth } from "@/lib/expense";

// 지출 (개인 가계부 / 회사 지출). 슈퍼 관리자만 볼 수 있다.
// 한 달에 한 줄씩(ledger_months) 저장된 가계부를 전부 불러온다. 1년에 12줄이라 한 번에 읽어도 가볍다.
export default async function ExpensesPage() {
  await requireSuperAdmin();

  // 오늘 날짜 (한국 시간 기준, 예: 2026-10-30)
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

  const { data, error } = await createSupabaseAdminClient()
    .from("ledger_months")
    .select("month, income, fixed, days, updated_at")
    .eq("book", "personal");
  if (error) throw new Error(`가계부를 불러오지 못했어요: ${error.message}`);

  const months: Record<string, LedgerMonth> = {};
  // 달마다 마지막 저장 시각: 다른 기기에서 바뀌었는지 확인하는 데 쓴다
  const versions: Record<string, string> = {};
  for (const row of data ?? []) {
    const clean = cleanLedgerMonth(row.month, row);
    if (clean) {
      months[row.month] = clean;
      versions[row.month] = row.updated_at;
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto max-w-[1000px] px-4 py-10 md:px-6 md:py-12">
        <h1 className="mb-2 text-[28px] font-bold text-[#1d1d1f]">지출</h1>
        <div className="mb-6 flex gap-6 border-b border-black/10">
          <span className="-mb-px border-b-2 border-[#1d1d1f] pb-3 text-[16px] font-semibold text-[#1d1d1f]">개인</span>
          <span className="pb-3 text-[16px] font-semibold text-[#adb1ba]">회사 (준비 중)</span>
        </div>
        <ExpenseLedger today={today} initialMonths={months} initialVersions={versions} />
      </div>
    </div>
  );
}
