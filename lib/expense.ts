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

// ---------------------------------------------------------------------------
// 회사 정기 결제 (구독·연회비·한 번 낸 비용)
// company_ledger 표의 key = "recurring" 한 줄에 목록 전체를 저장한다.

export type RecurringCycle = "monthly" | "yearly" | "once";
/** 결제 기록. krw 0 = 원화 금액 미입력. auto = 결제일이 지나서 자동으로 생긴 기록 */
export type CompanyPayment = { date: string; krw: number; usd: number; auto: boolean };
export type CompanyRecurring = {
  name: string;
  cycle: RecurringCycle;
  // 결제일: monthly → day / yearly → month+day / once → year+month+day
  month: number;
  day: number;
  year: number;
  currency: "KRW" | "USD";
  // 기준 금액 (원 또는 달러)
  base: number;
  memo: string;
  // 자동 기록 시작일 ("" = 자동 기록 안 함)
  start: string;
  // 자동 기록을 어디까지 확인했는지 ("" = 아직). 지운 자동 기록이 다시 생기지 않게 한다.
  autoUntil: string;
  payments: CompanyPayment[];
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const pad2 = (n: number) => String(n).padStart(2, "0");
const clampDay = (y: number, m: number, day: number) => Math.min(day, new Date(y, m, 0).getDate());

/** 저장 전에 정기 결제 목록을 검사·정리한다. 형식이 틀리면 null */
export function cleanCompanyRecurring(value: unknown): CompanyRecurring[] | null {
  if (!Array.isArray(value) || value.length > LEDGER_ITEMS_MAX) return null;
  const out: CompanyRecurring[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    const cycle = r.cycle;
    if (cycle !== "monthly" && cycle !== "yearly" && cycle !== "once") return null;
    if (r.currency !== "KRW" && r.currency !== "USD") return null;
    const int = (n: unknown, min: number, max: number) => Number.isInteger(n) && (n as number) >= min && (n as number) <= max;
    if (!int(r.day, 1, 31) || !int(r.month, 0, 12) || !int(r.year, 0, 9999)) return null;
    if (typeof r.base !== "number" || !(r.base >= 0) || r.base > AMOUNT_LIMIT) return null;
    const date = (s: unknown) => (typeof s === "string" && DATE_PATTERN.test(s) ? s : "");
    if (!Array.isArray(r.payments) || r.payments.length > 1000) return null;
    const payments: CompanyPayment[] = [];
    for (const p of r.payments as Record<string, unknown>[]) {
      if (!p || !date(p.date) || !isAmount(p.krw) || (p.krw as number) < 0) return null;
      if (typeof p.usd !== "number" || !(p.usd >= 0) || p.usd > AMOUNT_LIMIT) return null;
      payments.push({ date: p.date as string, krw: p.krw as number, usd: p.usd, auto: p.auto === true });
    }
    out.push({
      name: text(r.name),
      cycle,
      month: r.month as number,
      day: r.day as number,
      year: r.year as number,
      currency: r.currency,
      base: r.base,
      memo: text(r.memo),
      start: date(r.start),
      autoUntil: date(r.autoUntil),
      payments,
    });
  }
  return out;
}

/** 다음 결제일 (오늘 포함 이후 첫 결제일). 한 번 낸 비용은 null */
export function nextDue(r: Pick<CompanyRecurring, "cycle" | "month" | "day">, today: string): string | null {
  const [ty, tm, td] = today.split("-").map(Number);
  if (r.cycle === "monthly") {
    let y = ty;
    let m = tm;
    if (clampDay(y, m, r.day) < td) {
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
    return `${y}-${pad2(m)}-${pad2(clampDay(y, m, r.day))}`;
  }
  if (r.cycle === "yearly") {
    const thisYear = `${ty}-${pad2(r.month)}-${pad2(clampDay(ty, r.month, r.day))}`;
    return thisYear >= today ? thisYear : `${ty + 1}-${pad2(r.month)}-${pad2(clampDay(ty + 1, r.month, r.day))}`;
  }
  return null;
}

/**
 * 결제 기록 자동 추가.
 * 시작일부터 오늘까지 결제일이 지난 회차마다, 그 회차(1달 = 그 달, 1년 = 그 해)에 기록이 없으면
 * 기준 금액으로 기록을 만든다 (달러 항목은 원화 금액을 비워 둔다).
 * autoUntil 이후의 결제일만 보므로, 사용자가 지운 자동 기록은 다시 생기지 않는다.
 * 바뀐 게 없으면 같은 객체를 그대로 돌려준다.
 */
export function applyAutoPayments(r: CompanyRecurring, today: string): CompanyRecurring {
  if (r.cycle === "once" || !r.start || r.start > today) return r;
  const dues: string[] = [];
  const [sy, sm] = r.start.split("-").map(Number);
  const [ty, tm] = today.split("-").map(Number);
  if (r.cycle === "monthly") {
    for (let y = sy, m = sm; y < ty || (y === ty && m <= tm); m === 12 ? (y++, (m = 1)) : m++) {
      dues.push(`${y}-${pad2(m)}-${pad2(clampDay(y, m, r.day))}`);
    }
  } else {
    for (let y = sy; y <= ty; y++) dues.push(`${y}-${pad2(r.month)}-${pad2(clampDay(y, r.month, r.day))}`);
  }
  const period = (date: string) => date.slice(0, r.cycle === "monthly" ? 7 : 4);
  const added: CompanyPayment[] = [];
  for (const due of dues) {
    if (due < r.start || due > today || (r.autoUntil && due <= r.autoUntil)) continue;
    if (r.payments.some((p) => period(p.date) === period(due))) continue;
    added.push({ date: due, krw: r.currency === "KRW" ? r.base : 0, usd: r.currency === "USD" ? r.base : 0, auto: true });
  }
  if (added.length === 0 && r.autoUntil === today) return r;
  return { ...r, payments: [...r.payments, ...added], autoUntil: today };
}
