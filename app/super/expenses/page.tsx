import { requireSuperAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import Link from "next/link";
import ExpenseLedger from "@/components/ExpenseLedger";
import CompanyLedger from "@/components/CompanyLedger";
import { cleanCompanyRecurring, cleanLedgerMonth, type LedgerMonth } from "@/lib/expense";

// 지출 (개인 가계부 / 회사 지출). 슈퍼 관리자만 볼 수 있다.
type PageProps = {
  // ?book=company 이면 회사, 없으면 개인
  searchParams: Promise<{ book?: string }>;
};

export default async function ExpensesPage({ searchParams }: PageProps) {
  await requireSuperAdmin();
  const isCompany = (await searchParams).book === "company";

  // 오늘 날짜 (한국 시간 기준, 예: 2026-10-30)
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto max-w-[1000px] px-4 py-10 md:px-6 md:py-12">
        <h1 className="mb-2 text-[28px] font-bold text-[#1d1d1f]">지출</h1>
        <div className="mb-6 flex gap-6 border-b border-black/10">
          {[
            { label: "개인", href: "/super/expenses", active: !isCompany },
            { label: "회사", href: "/super/expenses?book=company", active: isCompany },
          ].map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`-mb-px border-b-2 pb-3 text-[16px] font-semibold ${
                tab.active ? "border-[#1d1d1f] text-[#1d1d1f]" : "border-transparent text-[#adb1ba] hover:text-[#1d1d1f]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        {isCompany ? <CompanySection today={today} /> : <PersonalSection today={today} />}
      </div>
    </div>
  );
}

// 개인 가계부: 한 달에 한 줄씩(ledger_months) 저장된 것을 전부 불러온다. 1년에 12줄이라 한 번에 읽어도 가볍다.
async function PersonalSection({ today }: { today: string }) {
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
  return <ExpenseLedger today={today} initialMonths={months} initialVersions={versions} />;
}

// 회사 지출: 정기 결제 목록 한 줄(company_ledger, key = "recurring")
async function CompanySection({ today }: { today: string }) {
  const { data, error } = await createSupabaseAdminClient()
    .from("company_ledger")
    .select("data, updated_at")
    .eq("key", "recurring")
    .maybeSingle();
  if (error) throw new Error(`회사 지출을 불러오지 못했어요: ${error.message}`);
  const items = data ? cleanCompanyRecurring(data.data) : [];
  if (!items) throw new Error("회사 지출 데이터 형식이 맞지 않아요.");
  return <CompanyLedger today={today} initialItems={items} initialVersion={data?.updated_at ?? null} />;
}
