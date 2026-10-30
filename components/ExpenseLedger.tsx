"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { saveLedgerMonth } from "@/app/super/expenses/actions";
import { formatParts, parseAmount, type LedgerMonth } from "@/lib/expense";

/*
 * 개인 가계부. 고치면 잠깐(0.8초) 기다렸다가 그 달 전체를 자동 저장한다.
 * 한 달 = 소득 항목 + 고정지출 항목 + 날짜별 사용 금액.
 *   지출 = 날짜별 사용 금액 합 + 고정지출 합
 *   여분 = 소득 - 지출
 * 진행 중인 달은 "적은 날"의 하루 평균으로 그 달 전체 사용 금액을 예상한다.
 * 비워 둔 날은 평균에서 빠지고, 0원을 적은 날은 "0원 쓴 날"로 평균에 들어간다.
 * 금액칸에는 계산식을 적을 수 있다 ("3000 5700 2400" → 11,100원, lib/expense.ts).
 * 모바일에서는 "오늘 사용 금액" 칸을 맨 위에 두고, 날짜 전체 목록은 접어 둔다.
 */

type Item = { id: number; name: string; amount: number; expr: string };
// amount: null = 안 적은 날, 0 = 0원 쓴 날
type DayEntry = { amount: number | null; memo: string; expr: string };
type MonthData = { income: Item[]; fixed: Item[]; daily: Record<number, DayEntry> };

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function daysIn(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
function weekday(key: string, day: number) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, day).getDay();
}
function shiftMonth(key: string, diff: number) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + diff, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return `${y}년 ${m}월`;
}
const sum = (items: Item[]) => items.reduce((a, i) => a + i.amount, 0);
const dayColor = (w: number) => (w === 0 ? "text-red-500" : w === 6 ? "text-[#1b64da]" : "text-[#1d1d1f]");

// 화면에서 줄을 구분하는 번호 (저장하지 않는다)
let nextId = 1;
const item = (name: string, amount: number, expr = ""): Item => ({ id: nextId++, name, amount, expr });

// DB 형식 ↔ 화면 형식
function fromLedger(m: LedgerMonth): MonthData {
  return {
    income: m.income.map((i) => item(i.name, i.amount, i.expr)),
    fixed: m.fixed.map((i) => item(i.name, i.amount, i.expr)),
    daily: m.days,
  };
}
function toLedger(m: MonthData): LedgerMonth {
  const strip = (items: Item[]) => items.map(({ name, amount, expr }) => ({ name, amount, expr }));
  return { income: strip(m.income), fixed: strip(m.fixed), days: m.daily };
}

const SAVE_DELAY_MS = 800;
type SaveState = "saved" | "saving" | "error" | "conflict";

const EMPTY = (): MonthData => ({ income: [], fixed: [], daily: {} });
const EMPTY_DAY: DayEntry = { amount: null, memo: "", expr: "" };

const cardClass = "rounded-[16px] bg-white px-4 py-4 shadow-sm md:px-5";
const inputClass =
  "w-full rounded-[8px] border border-[#dcdee3] bg-white px-3 py-2 text-[15px] text-[#1d1d1f] placeholder:text-[#adb1ba] focus:border-[#1d1d1f] focus:outline-none";

/**
 * 금액칸. 계산식을 적을 수 있다 ("3000 5700 2400").
 * 적는 동안 "= 11,100원" 미리보기가 뜨고, 칸을 벗어나거나 Enter를 누르면 합계로 들어간다.
 * 다시 누르면 적었던 계산식이 그대로 나와서 고칠 수 있다.
 * amount가 null이면 "안 적은 칸", 0이면 "0원이라고 적은 칸"이다. 칸을 비우면 null로 돌아간다.
 * hint를 주면(큰 입력칸) 미리보기·오류를 칸 아래 줄에 보여주고, 없으면 작은 말풍선으로 띄운다.
 */
function AmountInput({
  amount,
  expr,
  onCommit,
  placeholder,
  large,
  hint,
}: {
  amount: number | null;
  expr: string;
  onCommit: (amount: number | null, expr: string) => void;
  placeholder?: string;
  large?: boolean;
  hint?: string;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const parsed = editing === null ? null : parseAmount(editing);
  const invalid = editing !== null && !parsed;
  const preview = parsed && parsed.parts.length > 1 ? `= ${won(parsed.total)}` : null;

  function commit() {
    if (editing === null) return;
    const result = parseAmount(editing);
    if (result) onCommit(result.parts.length ? result.total : null, result.parts.length > 1 ? editing.trim() : "");
    setEditing(null);
  }

  if (hint !== undefined) {
    return (
      <div>
        {renderInput()}
        <p className={`mt-1 text-right text-[13px] ${invalid ? "text-red-600" : preview ? "font-semibold text-[#1d1d1f]" : "text-[#868b94]"}`}>
          {invalid ? "숫자, 띄어쓰기, +, - 만 쓸 수 있어요" : (preview ?? hint)}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {renderInput()}
      {invalid && (
        <p className="absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded bg-red-50 px-2 py-0.5 text-[12px] text-red-600">
          숫자, 띄어쓰기, +, - 만 쓸 수 있어요
        </p>
      )}
      {preview && (
        <p className="absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded bg-[#1d1d1f] px-2 py-0.5 text-[12px] font-semibold text-white">
          {preview}
        </p>
      )}
    </div>
  );

  function renderInput() {
    return (
      <input
        inputMode={large ? "text" : "numeric"}
        value={editing ?? (amount === null ? "" : amount.toLocaleString("ko-KR"))}
        onFocus={() => setEditing(expr || (amount === null ? "" : String(amount)))}
        onChange={(e) => setEditing(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) e.currentTarget.blur();
        }}
        placeholder={placeholder ?? "0"}
        className={`${inputClass} text-right tabular-nums ${large ? "py-3 text-[22px] font-bold" : ""} ${
          invalid ? "border-red-400" : ""
        }`}
      />
    );
  }
}

// 소득·고정지출처럼 "이름 + 금액" 줄을 더하고 지우는 목록
function ItemList({
  title,
  items,
  onChange,
  addLabel,
  extra,
}: {
  title: string;
  items: Item[];
  onChange: (items: Item[]) => void;
  addLabel: string;
  extra?: React.ReactNode;
}) {
  const update = (id: number, patch: Partial<Item>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  return (
    <section className={cardClass}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-[#1d1d1f]">{title}</h3>
        <p className="text-[16px] font-bold tabular-nums text-[#1d1d1f]">{won(sum(items))}</p>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((i) => (
          <div key={i.id} className="grid grid-cols-[1fr_120px_28px] items-center gap-2">
            <input
              value={i.name}
              onChange={(e) => update(i.id, { name: e.target.value })}
              placeholder="항목 (메모)"
              className={inputClass}
            />
            <AmountInput amount={i.amount} expr={i.expr} onCommit={(amount, expr) => update(i.id, { amount: amount ?? 0, expr })} />
            <button
              type="button"
              aria-label="삭제"
              onClick={() => onChange(items.filter((x) => x.id !== i.id))}
              className="text-[18px] text-[#adb1ba] hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([...items, item("", 0)])}
          className="rounded-[8px] bg-[#f2f3f6] px-3 py-1.5 text-[13px] font-semibold text-[#1d1d1f] hover:bg-[#e9ebee]"
        >
          + {addLabel}
        </button>
        {extra}
      </div>
    </section>
  );
}

export default function ExpenseLedger({
  today,
  initialMonths,
  initialVersions,
}: {
  today: string;
  // DB에 저장된 달들 (키 = "2026-10")
  initialMonths: Record<string, LedgerMonth>;
  // 달마다 DB의 마지막 저장 시각(updated_at). 저장할 때 다른 기기에서 바뀌었는지 확인하는 데 쓴다.
  initialVersions: Record<string, string>;
}) {
  // today = "2026-10-30" (한국 시간)
  const todayKey = today.slice(0, 7);
  const todayDay = Number(today.slice(8, 10));

  const [data, setData] = useState<Record<string, MonthData>>(() =>
    Object.fromEntries(Object.entries(initialMonths).map(([k, v]) => [k, fromLedger(v)]))
  );

  // ---- 자동 저장: 고친 달을 기억해 두었다가 0.8초 동안 더 고치지 않으면 저장 ----
  // 다른 기기에서 먼저 저장한 달이면(conflict) 덮어쓰지 않고 멈춘 뒤 새로고침을 안내한다.
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const dirty = useRef(new Set<string>());
  const dataRef = useRef(data);
  const versions = useRef<Record<string, string>>(initialVersions);
  const conflicted = useRef(false);
  useEffect(() => {
    dataRef.current = data;
    if (dirty.current.size === 0 || conflicted.current) return;
    const timer = setTimeout(async () => {
      const months = [...dirty.current];
      dirty.current.clear();
      setSaveState("saving");
      try {
        for (const key of months) {
          const result = await saveLedgerMonth("personal", key, toLedger(dataRef.current[key]), versions.current[key] ?? null);
          if ("conflict" in result) {
            conflicted.current = true;
            setSaveState("conflict");
            return;
          }
          if ("error" in result) throw new Error(result.error);
          versions.current[key] = result.updatedAt;
        }
        setSaveState("saved");
        setSaveError(null);
      } catch (err) {
        months.forEach((k) => dirty.current.add(k)); // 다음 수정 때 다시 저장
        setSaveState("error");
        setSaveError(err instanceof Error ? err.message : "저장하지 못했어요.");
      }
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [data]);

  // 저장 전에 창을 닫으려 하면 경고 (다른 기기와 겹쳐 멈춘 경우는 새로고침해야 하므로 제외)
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current.size > 0 && !conflicted.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const [month, setMonth] = useState(todayKey);
  // 위쪽 빠른 입력칸이 가리키는 날 (기본: 오늘)
  const [quickDay, setQuickDay] = useState(todayDay);
  // 모바일에서 날짜 전체 목록 펼치기
  const [showAll, setShowAll] = useState(false);

  const m = data[month] ?? EMPTY();
  const setM = (patch: Partial<MonthData>) => {
    dirty.current.add(month);
    setData((d) => ({ ...d, [month]: { ...(d[month] ?? EMPTY()), ...patch } }));
  };
  const setDay = (day: number, patch: Partial<DayEntry>) => {
    dirty.current.add(month);
    setData((d) => {
      const cur = d[month] ?? EMPTY();
      return { ...d, [month]: { ...cur, daily: { ...cur.daily, [day]: { ...(cur.daily[day] ?? EMPTY_DAY), ...patch } } } };
    });
  };

  const daysInMonth = daysIn(month);
  const isCurrent = month === todayKey;
  const isFuture = month > todayKey;

  const stats = useMemo(() => {
    const entered = Object.entries(m.daily).filter(([, v]) => v.amount !== null);
    const dailyTotal = entered.reduce((a, [, v]) => a + (v.amount ?? 0), 0);
    const lastDay = entered.reduce((a, [d]) => Math.max(a, Number(d)), 0);
    const income = sum(m.income);
    const fixed = sum(m.fixed);
    const avg = entered.length ? dailyTotal / entered.length : 0;
    const projectedDaily = avg * daysInMonth;
    return {
      dailyTotal,
      lastDay,
      enteredCount: entered.length,
      income,
      fixed,
      spent: dailyTotal + fixed,
      left: income - dailyTotal - fixed,
      avg,
      projectedDaily,
      projectedSpent: projectedDaily + fixed,
      projectedLeft: income - projectedDaily - fixed,
    };
  }, [m, daysInMonth]);

  const prevKey = shiftMonth(month, -1);
  const prevFixed = data[prevKey]?.fixed ?? [];
  const quick = m.daily[quickDay] ?? EMPTY_DAY;
  const quickParts = quick.expr ? parseAmount(quick.expr)?.parts : null;
  // 모바일 목록을 접었을 때는 금액을 적은 날만, 최근 날짜부터 보여준다
  const enteredDays = Object.keys(m.daily)
    .map(Number)
    .filter((d) => m.daily[d].amount !== null)
    .sort((a, b) => b - a);

  // 날짜 한 줄. (컴포넌트로 만들면 입력할 때마다 칸이 새로 그려져 커서가 빠지므로 일반 함수로 둔다)
  function dayRow(day: number) {
    const w = weekday(month, day);
    const entry = m.daily[day] ?? EMPTY_DAY;
    const parts = entry.expr ? parseAmount(entry.expr)?.parts : null;
    return (
      <div
        key={day}
        className={`grid grid-cols-[58px_1fr_112px] items-start gap-2 border-b border-black/5 py-1.5 last:border-0 md:grid-cols-[64px_1fr_120px] ${
          isCurrent && day === todayDay ? "-mx-2 rounded-[8px] bg-[#fff4ea] px-2" : ""
        }`}
      >
        <p className={`pt-2 text-[14px] font-semibold ${dayColor(w)}`}>
          {day}일 <span className="font-normal">({WEEKDAYS[w]})</span>
        </p>
        <input
          value={entry.memo}
          onChange={(e) => setDay(day, { memo: e.target.value })}
          placeholder="메모 (선택)"
          className={`${inputClass} py-1.5 text-[14px]`}
        />
        <div>
          <AmountInput
            amount={entry.amount}
            expr={entry.expr}
            onCommit={(amount, expr) => setDay(day, { amount, expr })}
            placeholder="—"
          />
          {parts && <p className="mt-0.5 text-right text-[11px] text-[#868b94]">{formatParts(parts)}</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 달 이동 */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMonth(prevKey)}
          className="rounded-full bg-white px-3 py-2 text-[14px] shadow-sm hover:bg-[#f2f3f6] md:px-4"
        >
          ◀<span className="hidden md:inline"> 이전 달</span>
        </button>
        <p className="text-[20px] font-bold text-[#1d1d1f] md:text-[22px]">
          {monthLabel(month)}
          {isCurrent && <span className="ml-2 align-middle text-[13px] font-semibold text-[#e8893a]">진행 중</span>}
        </p>
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, 1))}
          className="rounded-full bg-white px-3 py-2 text-[14px] shadow-sm hover:bg-[#f2f3f6] md:px-4"
        >
          <span className="hidden md:inline">다음 달 </span>▶
        </button>
      </div>

      {saveState === "conflict" ? (
        <div className="mb-4 rounded-[12px] bg-[#fff4ea] px-4 py-3 text-center text-[14px] text-[#4d5159]">
          <p className="font-semibold text-[#1d1d1f]">⚠️ 다른 기기에서 이 가계부가 바뀌었어요</p>
          <p className="mt-1">
            겹쳐서 지워지지 않게 저장을 멈췄어요. 새로고침해서 최신 내용을 불러온 뒤, 방금 고친 내용을 다시 적어주세요.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 rounded-[10px] bg-[#1d1d1f] px-5 py-2 text-[14px] font-semibold text-white hover:opacity-90"
          >
            새로고침
          </button>
        </div>
      ) : (
        <p
          className={`-mt-2 mb-4 text-center text-[13px] ${
            saveState === "error" ? "text-red-600" : "text-[#868b94]"
          }`}
        >
          {saveState === "saving" ? "저장 중..." : saveState === "error" ? `⚠️ ${saveError} (고치면 다시 시도해요)` : "자동 저장돼요 ✓"}
        </p>
      )}

      {/* 빠른 입력: 진행 중인 달에서 오늘(또는 고른 날) 사용 금액 */}
      {isCurrent && (
        <section className="mb-4 rounded-[20px] border-2 border-[#1d1d1f] bg-white px-4 py-4 md:px-5">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="전날"
              disabled={quickDay <= 1}
              onClick={() => setQuickDay((d) => d - 1)}
              className="h-9 w-9 rounded-full bg-[#f2f3f6] text-[14px] disabled:opacity-30"
            >
              ◀
            </button>
            <p className="text-[17px] font-bold text-[#1d1d1f]">
              {quickDay === todayDay ? "오늘" : quickDay === todayDay - 1 ? "어제" : ""}{" "}
              <span className={dayColor(weekday(month, quickDay))}>
                {Number(month.slice(5))}월 {quickDay}일 ({WEEKDAYS[weekday(month, quickDay)]})
              </span>
            </p>
            <button
              type="button"
              aria-label="다음 날"
              disabled={quickDay >= todayDay}
              onClick={() => setQuickDay((d) => d + 1)}
              className="h-9 w-9 rounded-full bg-[#f2f3f6] text-[14px] disabled:opacity-30"
            >
              ▶
            </button>
          </div>
          <AmountInput
            key={`${month}-${quickDay}`}
            large
            amount={quick.amount}
            expr={quick.expr}
            onCommit={(amount, expr) => setDay(quickDay, { amount, expr })}
            placeholder="0원"
            hint={quickParts ? formatParts(quickParts) : "띄어서 적으면 더해져요 (예: 3000 5700)"}
          />
          <input
            value={quick.memo}
            onChange={(e) => setDay(quickDay, { memo: e.target.value })}
            placeholder="메모 (선택)"
            className={`${inputClass} mt-2`}
          />
        </section>
      )}

      {/* 요약 */}
      {isCurrent || isFuture ? (
        <section className="mb-4 rounded-[20px] bg-[#1d1d1f] px-5 py-5 text-white md:px-6 md:py-6">
          <p className="text-[14px] text-white/60">
            {stats.lastDay ? `${stats.lastDay}일까지 사용 금액` : "아직 적은 날이 없어요"}
          </p>
          <p className="mt-1 text-[28px] font-bold tabular-nums md:text-[32px]">{won(stats.dailyTotal)}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/15 pt-4 md:grid-cols-4 md:pt-5">
            <div>
              <p className="text-[13px] text-white/60">하루 평균</p>
              <p className="mt-1 text-[17px] font-bold tabular-nums md:text-[18px]">{won(stats.avg)}</p>
              <p className="text-[12px] text-white/50">적은 {stats.enteredCount}일 기준</p>
            </div>
            <div>
              <p className="text-[13px] text-white/60">{Number(month.slice(5))}월 예상 사용</p>
              <p className="mt-1 text-[17px] font-bold tabular-nums md:text-[18px]">{won(stats.projectedDaily)}</p>
              <p className="text-[12px] text-white/50">하루 평균 × {daysInMonth}일</p>
            </div>
            <div>
              <p className="text-[13px] text-white/60">예상 총지출</p>
              <p className="mt-1 text-[17px] font-bold tabular-nums md:text-[18px]">{won(stats.projectedSpent)}</p>
              <p className="text-[12px] text-white/50">+ 고정 {won(stats.fixed)}</p>
            </div>
            <div>
              <p className="text-[13px] text-white/60">예상 여분</p>
              <p
                className={`mt-1 text-[17px] font-bold tabular-nums md:text-[18px] ${
                  stats.projectedLeft < 0 ? "text-[#ff8a80]" : "text-[#7ee0a1]"
                }`}
              >
                {won(stats.projectedLeft)}
              </p>
              <p className="text-[12px] text-white/50">소득 {won(stats.income)} 기준</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "소득", value: stats.income, color: "text-[#1d1d1f]" },
            {
              label: "지출",
              value: stats.spent,
              color: "text-[#1d1d1f]",
              sub: `사용 ${won(stats.dailyTotal)} + 고정 ${won(stats.fixed)}`,
            },
            { label: "여분", value: stats.left, color: stats.left < 0 ? "text-red-600" : "text-[#16a34a]" },
          ].map((c) => (
            <div key={c.label} className={cardClass}>
              <p className="text-[13px] text-[#6e6e73]">{c.label}</p>
              <p className={`mt-1 text-[22px] font-bold tabular-nums md:text-[24px] ${c.color}`}>{won(c.value)}</p>
              {c.sub && <p className="mt-1 text-[12px] text-[#6e6e73]">{c.sub}</p>}
            </div>
          ))}
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-[1fr_360px] md:items-start">
        {/* 날짜별 사용 금액 */}
        <section className={cardClass}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#1d1d1f]">날짜별 사용 금액</h3>
            <p className="text-[16px] font-bold tabular-nums text-[#1d1d1f]">총 {won(stats.dailyTotal)}</p>
          </div>

          {/* 모바일 + 접힘: 적은 날만 최근 순 */}
          {!showAll && (
            <div className="md:hidden">
              {enteredDays.length === 0 ? (
                <p className="py-4 text-center text-[14px] text-[#868b94]">아직 적은 날이 없어요.</p>
              ) : (
                enteredDays.map(dayRow)
              )}
            </div>
          )}
          {/* PC 또는 모바일 펼침: 1일부터 마지막 날까지 */}
          <div className={showAll ? "" : "hidden md:block"}>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(dayRow)}
          </div>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="mt-3 w-full rounded-[10px] bg-[#f2f3f6] py-2.5 text-[14px] font-semibold text-[#1d1d1f] md:hidden"
          >
            {showAll ? "적은 날만 보기" : `날짜 전체 보기 (${daysInMonth}일)`}
          </button>
        </section>

        <div className="flex flex-col gap-4 md:sticky md:top-4">
          <ItemList title="소득" items={m.income} onChange={(income) => setM({ income })} addLabel="소득 추가" />
          <ItemList
            title="고정지출"
            items={m.fixed}
            onChange={(fixed) => setM({ fixed })}
            addLabel="고정지출 추가"
            extra={
              prevFixed.length > 0 && (
                <button
                  type="button"
                  onClick={() => setM({ fixed: prevFixed.map((f) => item(f.name, f.amount, f.expr)) })}
                  className="rounded-[8px] bg-[#f2f3f6] px-3 py-1.5 text-[13px] font-semibold text-[#1d1d1f] hover:bg-[#e9ebee]"
                >
                  지난달 고정지출 불러오기
                </button>
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
