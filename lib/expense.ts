// 가계부 규칙. 화면(components/ExpenseLedger.tsx)과 저장(app/super/expenses/actions.ts)이 같은 기준을 쓴다.

/** 가계부 종류. 지금은 개인만 쓰고, 회사는 나중에 같은 표에 book = "company"로 쌓는다. */
export type LedgerBook = "personal" | "company";

/** 소득·고정지출 한 줄. expr = 금액칸에 적은 계산식 (예: "3000 5700"), 없으면 "" */
export type LedgerItem = { name: string; amount: number; expr: string };
/** 날짜별 사용 금액. amount: null = 안 적은 날, 0 = 0원 쓴 날 */
export type LedgerDay = { amount: number | null; memo: string; expr: string };
/** 한 달치 가계부. 키 = "2026-10" */
export type LedgerMonth = {
  income: LedgerItem[];
  fixed: LedgerItem[];
  days: Record<number, LedgerDay>;
};

export const LEDGER_TEXT_MAX = 100;
export const LEDGER_ITEMS_MAX = 50;
// 금액 한 칸의 한도 (1조 원). 오타로 터무니없는 숫자가 저장되지 않게 한다.
const AMOUNT_LIMIT = 1_000_000_000_000;

export function isMonthKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function daysInMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

const isAmount = (n: unknown): n is number => Number.isInteger(n) && Math.abs(n as number) <= AMOUNT_LIMIT;
const text = (s: unknown) => (typeof s === "string" ? s.slice(0, LEDGER_TEXT_MAX) : "");

/** 저장 전에 한 달치 데이터를 검사·정리한다. 형식이 틀리면 null */
export function cleanLedgerMonth(key: string, value: unknown): LedgerMonth | null {
  if (!isMonthKey(key) || !value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const items = (list: unknown): LedgerItem[] | null => {
    if (!Array.isArray(list) || list.length > LEDGER_ITEMS_MAX) return null;
    const out: LedgerItem[] = [];
    for (const i of list) {
      if (!i || typeof i !== "object" || !isAmount((i as LedgerItem).amount)) return null;
      out.push({ name: text((i as LedgerItem).name), amount: (i as LedgerItem).amount, expr: text((i as LedgerItem).expr) });
    }
    return out;
  };
  const income = items(v.income);
  const fixed = items(v.fixed);
  if (!income || !fixed || !v.days || typeof v.days !== "object") return null;

  const days: Record<number, LedgerDay> = {};
  const last = daysInMonth(key);
  for (const [k, d] of Object.entries(v.days as Record<string, unknown>)) {
    const day = Number(k);
    if (!Number.isInteger(day) || day < 1 || day > last || !d || typeof d !== "object") return null;
    const amount = (d as LedgerDay).amount;
    if (amount !== null && !isAmount(amount)) return null;
    const memo = text((d as LedgerDay).memo);
    // 금액도 메모도 없는 날은 저장하지 않는다
    if (amount === null && !memo) continue;
    days[day] = { amount, memo, expr: text((d as LedgerDay).expr) };
  }
  return { income, fixed, days };
}

/**
 * 금액칸에 적은 계산식을 더한다.
 *   "3000 5700 2400"     → 11,100  (띄어쓰기 = 더하기)
 *   "3000+5700+2400"     → 11,100
 *   "3,000 + 5,700원"    → 8,700   (쉼표·"원"은 무시)
 *   "12000 -3000"        → 9,000   (빼기: 환불 등)
 * 숫자·띄어쓰기·+·-·쉼표·"원" 말고 다른 글자가 있으면 null (계산할 수 없음).
 */
export function parseAmount(text: string): { total: number; parts: number[] } | null {
  const clean = text.replace(/원/g, "").replace(/(\d),(?=\d)/g, "$1").trim();
  if (!clean) return { total: 0, parts: [] };
  if (/[^\d\s+-]/.test(clean)) return null;
  const parts: number[] = [];
  const pattern = /([+-])?\s*(\d+)/g;
  let rest = clean;
  for (const match of clean.matchAll(pattern)) {
    parts.push(match[1] === "-" ? -Number(match[2]) : Number(match[2]));
    rest = rest.replace(match[0], "");
  }
  // 숫자 없이 기호만 남은 경우 (예: "+", "3000 +")
  if (parts.length === 0 || /[+-]/.test(rest)) return null;
  return { total: parts.reduce((a, b) => a + b, 0), parts };
}

/** 계산식 보여주기: [3000, 5700, -500] → "3,000 + 5,700 − 500" */
export function formatParts(parts: number[]) {
  return parts
    .map((p, i) => {
      const n = Math.abs(p).toLocaleString("ko-KR");
      if (i === 0) return p < 0 ? `−${n}` : n;
      return p < 0 ? `− ${n}` : `+ ${n}`;
    })
    .join(" ");
}
