"use client";

import { useEffect, useRef, useState } from "react";
import { saveCompanyRecurring } from "@/app/super/expenses/actions";
import {
  applyAutoPayments,
  nextDue,
  type CompanyPayment,
  type CompanyRecurring,
  type RecurringCycle,
} from "@/lib/expense";

/*
 * 회사 지출: 정기 결제 목록 (구독·연회비·한 번 낸 비용).
 * 항목마다 "결제 기록"(날짜 + 실제 빠져나간 원화 금액)을 쌓는다.
 * 자동 기록 시작일을 적으면, 결제일이 지날 때마다 기준 금액으로 기록이 자동으로 생긴다 (lib/expense.ts applyAutoPayments).
 * 달러 결제는 환율·수수료 때문에 원화 금액이 매번 달라서, 원화 금액은 비워 두고 직접 채운다.
 * 고치면 0.8초 뒤 목록 전체를 자동 저장하고, 다른 기기에서 먼저 바뀌었으면 덮어쓰지 않고 멈춘다.
 */

// 화면에서 줄을 구분하는 번호 (저장하지 않는다)
type Payment = CompanyPayment & { id: number };
type Recurring = Omit<CompanyRecurring, "payments"> & { id: number; payments: Payment[] };

let nextId = 1;
const withIds = (r: CompanyRecurring): Recurring => ({ ...r, id: nextId++, payments: r.payments.map((p) => ({ ...p, id: nextId++ })) });
const stripIds = (list: Recurring[]): CompanyRecurring[] =>
  list.map((r) => ({
    name: r.name,
    cycle: r.cycle,
    month: r.month,
    day: r.day,
    year: r.year,
    currency: r.currency,
    base: r.base,
    memo: r.memo,
    start: r.start,
    autoUntil: r.autoUntil,
    payments: r.payments.map((p) => ({ date: p.date, krw: p.krw, usd: p.usd, auto: p.auto })),
  }));
// 자동 기록 추가 (ids 유지: 새로 생긴 기록에만 번호를 붙인다)
function withAuto(r: Recurring, today: string): Recurring {
  const next = applyAutoPayments(r, today);
  if (next === r) return r;
  return { ...r, ...next, payments: next.payments.map((p) => ("id" in p ? (p as Payment) : { ...p, id: nextId++ })) };
}

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const CYCLE_LABEL: Record<RecurringCycle, string> = { monthly: "1달", yearly: "1년", once: "한 번" };
const dateLabel = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}. ${m}. ${d}.`;
};

const SAVE_DELAY_MS = 800;
type SaveState = "saved" | "saving" | "error" | "conflict";

const cardClass = "rounded-[16px] bg-white px-4 py-4 shadow-sm md:px-5";
const inputClass =
  "w-full rounded-[8px] border border-[#dcdee3] bg-white px-3 py-2 text-[15px] text-[#1d1d1f] placeholder:text-[#adb1ba] focus:border-[#1d1d1f] focus:outline-none";
const smallButton = "rounded-[8px] bg-[#f2f3f6] px-3 py-1.5 text-[13px] font-semibold text-[#1d1d1f] hover:bg-[#e9ebee]";

function NumberInput({
  value,
  onChange,
  placeholder,
  decimal,
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  // 달러는 소수점(예: 25.99)을 쓴다
  decimal?: boolean;
}) {
  const [text, setText] = useState<string | null>(null);
  return (
    <input
      inputMode={decimal ? "decimal" : "numeric"}
      value={text ?? (value ? value.toLocaleString("ko-KR", { maximumFractionDigits: 2 }) : "")}
      onFocus={() => setText(value ? String(value) : "")}
      onChange={(e) => {
        const clean = decimal ? e.target.value.replace(/[^0-9.]/g, "") : e.target.value.replace(/[^0-9]/g, "");
        setText(clean);
        onChange(Number(clean) || 0);
      }}
      onBlur={() => setText(null)}
      placeholder={placeholder ?? "0"}
      className={`${inputClass} text-right tabular-nums`}
    />
  );
}

function RecurringCard({
  r,
  today,
  onChange,
  onDelete,
}: {
  r: Recurring;
  today: string;
  onChange: (patch: Partial<Recurring>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const sorted = [...r.payments].sort((a, b) => b.date.localeCompare(a.date));
  const last = sorted[0];
  const due = nextDue(r, today);
  const totalPaid = r.payments.reduce((a, p) => a + p.krw, 0);
  const missing = r.payments.filter((p) => !p.krw).length;
  const setPayment = (id: number, patch: Partial<Payment>) =>
    onChange({ payments: r.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  // 결제일·주기·시작일을 바꾸면 자동 기록을 처음부터 다시 확인한다 (이미 기록이 있는 회차는 건너뜀)
  const changeSchedule = (patch: Partial<Recurring>) => onChange({ ...patch, autoUntil: "" });

  function addPayment() {
    // 오늘 날짜, 금액은 원화 항목이면 기준 금액·달러 항목이면 지난번 원화 금액으로 미리 채운다
    onChange({
      payments: [
        ...r.payments,
        {
          id: nextId++,
          date: today,
          krw: r.currency === "KRW" ? r.base : (last?.krw ?? 0),
          usd: r.currency === "USD" ? r.base : 0,
          auto: false,
        },
      ],
    });
    setShowPayments(true);
  }

  return (
    <div className="py-4">
      {editing ? (
        <div className="grid gap-2 md:grid-cols-[1fr_90px] md:items-center">
          <input value={r.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="항목" className={inputClass} />
          <select value={r.cycle} onChange={(e) => changeSchedule({ cycle: e.target.value as RecurringCycle })} className={inputClass}>
            <option value="monthly">1달</option>
            <option value="yearly">1년</option>
            <option value="once">한 번</option>
          </select>
          <div className="flex flex-wrap items-center gap-1 text-[14px] text-[#6e6e73] md:col-span-2">
            <span className="mr-1">결제일</span>
            {r.cycle === "once" && (
              <input
                inputMode="numeric"
                value={r.year || ""}
                onChange={(e) => onChange({ year: Number(e.target.value.replace(/\D/g, "").slice(0, 4)) || 0 })}
                className={`${inputClass} w-[72px] px-2`}
                aria-label="년"
              />
            )}
            {r.cycle !== "monthly" && (
              <select
                value={r.month || 1}
                onChange={(e) => changeSchedule({ month: Number(e.target.value) })}
                className={`${inputClass} w-[72px] px-2`}
                aria-label="월"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((mm) => (
                  <option key={mm} value={mm}>
                    {mm}월
                  </option>
                ))}
              </select>
            )}
            <select value={r.day} onChange={(e) => changeSchedule({ day: Number(e.target.value) })} className={`${inputClass} w-[72px] px-2`} aria-label="일">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}일
                </option>
              ))}
            </select>
            <span className="ml-3 mr-1">기준 금액</span>
            <select
              value={r.currency}
              onChange={(e) => onChange({ currency: e.target.value as "KRW" | "USD" })}
              className={`${inputClass} w-[60px] px-1`}
              aria-label="통화"
            >
              <option value="KRW">원</option>
              <option value="USD">$</option>
            </select>
            <div className="w-[120px]">
              <NumberInput value={r.base} onChange={(base) => onChange({ base })} decimal={r.currency === "USD"} />
            </div>
          </div>
          {r.cycle !== "once" && (
            <label className="flex flex-wrap items-center gap-2 text-[14px] text-[#6e6e73] md:col-span-2">
              <span>자동 기록 시작일</span>
              <input
                type="date"
                value={r.start}
                max={today}
                onChange={(e) => changeSchedule({ start: e.target.value })}
                className={`${inputClass} w-auto px-2 text-[14px]`}
              />
              <span className="text-[12px] text-[#868b94]">이날부터 결제일이 지나면 기준 금액으로 기록이 자동으로 생겨요. 비우면 자동 기록 안 함</span>
            </label>
          )}
          <input
            value={r.memo}
            onChange={(e) => onChange({ memo: e.target.value })}
            placeholder="메모 (예: 2026. 05. 10. 기준)"
            className={`${inputClass} md:col-span-2`}
          />
          <div className="flex justify-between md:col-span-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`"${r.name || "이 항목"}"과 결제 기록을 모두 지울까요?`)) onDelete();
              }}
              className="text-[13px] font-semibold text-red-600"
            >
              항목 삭제
            </button>
            <button type="button" onClick={() => setEditing(false)} className={smallButton}>
              완료
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[16px] font-semibold text-[#1d1d1f]">{r.name || "(이름 없음)"}</p>
            <p className="mt-0.5 text-[13px] text-[#868b94]">
              {CYCLE_LABEL[r.cycle]} ·{" "}
              {r.cycle === "monthly"
                ? `매달 ${r.day}일`
                : r.cycle === "yearly"
                  ? `매년 ${r.month}월 ${r.day}일`
                  : `${r.year}년 ${r.month}월 ${r.day}일`}
              {r.cycle !== "once" && (r.start ? ` · 자동 기록 ${dateLabel(r.start)}부터` : " · 자동 기록 꺼짐")}
              {r.memo && ` · ${r.memo}`}
            </p>
            <p className="mt-1 text-[13px] text-[#4d5159]">
              {last ? `마지막 결제 ${dateLabel(last.date)} ${last.krw ? won(last.krw) : "(원화 금액 미입력)"}` : "결제 기록 없음"}
              {due && <span className="text-[#868b94]"> · 다음 결제 {dateLabel(due)}</span>}
            </p>
            {missing > 0 && (
              <p className="mt-1 text-[12px] font-semibold text-[#e8893a]">원화 금액을 안 적은 기록이 {missing}건 있어요</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[16px] font-bold tabular-nums text-[#1d1d1f]">
              {r.currency === "USD" ? `$${r.base.toLocaleString("en-US")}` : won(r.base)}
            </p>
            <button type="button" onClick={() => setEditing(true)} className="mt-1 text-[13px] font-semibold text-[#868b94] hover:text-[#1d1d1f]">
              고치기
            </button>
          </div>
        </div>
      )}

      {/* 결제 기록 */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={addPayment} className={smallButton}>
          + 결제 기록
        </button>
        {r.payments.length > 0 && (
          <button type="button" onClick={() => setShowPayments((v) => !v)} className="text-[13px] font-semibold text-[#1b64da]">
            {showPayments ? "기록 접기" : `기록 ${r.payments.length}건 · 합계 ${won(totalPaid)}`}
          </button>
        )}
      </div>
      {showPayments && r.payments.length > 0 && (
        <div className="mt-2 flex flex-col gap-2 rounded-[12px] bg-[#f7f8fa] p-3">
          {sorted.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center gap-2 border-b border-black/5 pb-2 last:border-0 last:pb-0 md:flex-nowrap md:border-0 md:pb-0"
            >
              <div className="flex basis-full items-center gap-2 md:basis-auto md:flex-1">
                <input
                  type="date"
                  value={p.date}
                  onChange={(e) => setPayment(p.id, { date: e.target.value })}
                  className={`${inputClass} min-w-0 flex-1 px-2 text-[14px]`}
                  aria-label="결제한 날"
                />
                {p.auto && <span className="shrink-0 rounded-full bg-[#e8f3ff] px-2 py-0.5 text-[11px] font-semibold text-[#1b64da]">자동</span>}
              </div>
              {r.currency === "USD" && (
                <div className="relative w-[96px] shrink-0">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[13px] text-[#868b94]">$</span>
                  <NumberInput value={p.usd} onChange={(usd) => setPayment(p.id, { usd })} decimal />
                </div>
              )}
              <div className="min-w-0 flex-1 md:w-[130px] md:flex-none">
                <NumberInput value={p.krw} onChange={(krw) => setPayment(p.id, { krw })} placeholder="원화 금액" />
              </div>
              <button
                type="button"
                aria-label="기록 삭제"
                onClick={() => onChange({ payments: r.payments.filter((x) => x.id !== p.id) })}
                className="w-6 shrink-0 text-[18px] text-[#adb1ba] hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
          <p className="text-[12px] text-[#868b94]">
            &quot;자동&quot;은 결제일이 지나서 기준 금액으로 생긴 기록이에요. 금액이 다르면 고치고, 결제 안 했으면 지우면 돼요.
            {r.currency === "USD" && " 달러 항목은 실제로 빠져나간 원화 금액을 채워주세요."}
          </p>
        </div>
      )}
    </div>
  );
}

export default function CompanyLedger({
  today,
  initialItems,
  initialVersion,
}: {
  today: string;
  initialItems: CompanyRecurring[];
  // DB의 마지막 저장 시각 (아직 저장한 적 없으면 null)
  initialVersion: string | null;
}) {
  // 처음 열 때 결제일이 지난 회차의 자동 기록을 채운다. 채운 게 있으면 바로 저장한다.
  const [items, setItems] = useState<Recurring[]>(() => initialItems.map((r) => withAuto(withIds(r), today)));
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const dirty = useRef(items.some((r, i) => r.payments.length !== initialItems[i].payments.length || r.autoUntil !== initialItems[i].autoUntil));
  const version = useRef(initialVersion);
  const conflicted = useRef(false);
  const itemsRef = useRef(items);

  const update = (fn: (list: Recurring[]) => Recurring[]) => {
    dirty.current = true;
    setItems((list) => fn(list).map((r) => withAuto(r, today)));
  };

  // ---- 자동 저장 (개인 가계부와 같은 방식) ----
  useEffect(() => {
    itemsRef.current = items;
    if (!dirty.current || conflicted.current) return;
    const timer = setTimeout(async () => {
      dirty.current = false;
      setSaveState("saving");
      try {
        const result = await saveCompanyRecurring(stripIds(itemsRef.current), version.current);
        if ("conflict" in result) {
          conflicted.current = true;
          setSaveState("conflict");
          return;
        }
        if ("error" in result) throw new Error(result.error);
        version.current = result.updatedAt;
        setSaveState("saved");
        setSaveError(null);
      } catch (err) {
        dirty.current = true; // 다음 수정 때 다시 저장
        setSaveState("error");
        setSaveError(err instanceof Error ? err.message : "저장하지 못했어요.");
      }
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [items]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current && !conflicted.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  // 한 달로 치면: 1달 = 그대로, 1년 = ÷12, 한 번 = 제외. 달러는 마지막 실제 원화 금액 기준
  const monthlyCost = items.reduce((a, r) => {
    if (r.cycle === "once") return a;
    const lastKrw = [...r.payments].filter((p) => p.krw).sort((x, y) => y.date.localeCompare(x.date))[0]?.krw;
    const krw = r.currency === "KRW" ? r.base : (lastKrw ?? 0);
    return a + (r.cycle === "yearly" ? krw / 12 : krw);
  }, 0);
  // 실제 결제 기록 합계: 전체 / 연도별 / 달별 (최근부터)
  const allPayments = items.flatMap((r) => r.payments);
  const totalPaid = allPayments.reduce((a, p) => a + p.krw, 0);
  const byYear = Object.entries(
    allPayments.reduce<Record<string, number>>((acc, p) => {
      const y = p.date.slice(0, 4);
      acc[y] = (acc[y] ?? 0) + p.krw;
      return acc;
    }, {})
  ).sort(([a], [b]) => b.localeCompare(a));
  // 달별 합계 (최근 달부터). 기본은 최근 6개월만 보여주고 펼칠 수 있다.
  const byMonth = Object.entries(
    allPayments.reduce<Record<string, { sum: number; count: number }>>((acc, p) => {
      const m = p.date.slice(0, 7);
      acc[m] = { sum: (acc[m]?.sum ?? 0) + p.krw, count: (acc[m]?.count ?? 0) + 1 };
      return acc;
    }, {})
  ).sort(([a], [b]) => b.localeCompare(a));
  const shownMonths = showAllMonths ? byMonth : byMonth.slice(0, 6);

  return (
    <section className={cardClass}>
      {saveState === "conflict" ? (
        <div className="mb-4 rounded-[12px] bg-[#fff4ea] px-4 py-3 text-center text-[14px] text-[#4d5159]">
          <p className="font-semibold text-[#1d1d1f]">⚠️ 다른 기기에서 정기 결제 목록이 바뀌었어요</p>
          <p className="mt-1">겹쳐서 지워지지 않게 저장을 멈췄어요. 새로고침해서 최신 내용을 불러온 뒤, 방금 고친 내용을 다시 적어주세요.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 rounded-[10px] bg-[#1d1d1f] px-5 py-2 text-[14px] font-semibold text-white hover:opacity-90"
          >
            새로고침
          </button>
        </div>
      ) : (
        <p className={`mb-2 text-right text-[13px] ${saveState === "error" ? "text-red-600" : "text-[#868b94]"}`}>
          {saveState === "saving" ? "저장 중..." : saveState === "error" ? `⚠️ ${saveError} (고치면 다시 시도해요)` : "자동 저장돼요 ✓"}
        </p>
      )}

      <div className="border-b border-black/5 pb-4">
        <h3 className="text-[18px] font-bold text-[#1d1d1f]">정기 결제 목록</h3>
        <p className="mt-1 text-[13px] text-[#868b94]">구독·연회비·한 번 낸 비용</p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-[12px] bg-[#f7f8fa] px-4 py-3">
            <p className="text-[13px] text-[#868b94]">한 달로 치면</p>
            <p className="mt-1 text-[20px] font-bold tabular-nums text-[#1d1d1f]">약 {won(monthlyCost)}</p>
            <p className="mt-0.5 text-[12px] text-[#868b94]">기준 금액으로 계산 · 1년 ÷ 12 · 한 번은 빼고</p>
          </div>
          <div className="rounded-[12px] bg-[#f7f8fa] px-4 py-3">
            <p className="text-[13px] text-[#868b94]">총 낸 금액</p>
            <p className="mt-1 text-[20px] font-bold tabular-nums text-[#1d1d1f]">{won(totalPaid)}</p>
            <p className="mt-0.5 text-[12px] text-[#868b94]">결제 기록 {allPayments.length}건 전체</p>
          </div>
          <div className="rounded-[12px] bg-[#f7f8fa] px-4 py-3">
            <p className="text-[13px] text-[#868b94]">년마다 낸 금액</p>
            {byYear.length === 0 ? (
              <p className="mt-1 text-[14px] text-[#868b94]">결제 기록 없음</p>
            ) : (
              <ul className="mt-1 flex flex-col gap-0.5">
                {byYear.map(([y, sum]) => (
                  <li key={y} className="flex items-baseline justify-between gap-2 tabular-nums">
                    <span className="text-[14px] text-[#4d5159]">{y}년</span>
                    <span className="text-[17px] font-bold text-[#1d1d1f]">{won(sum)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* 달마다 낸 금액: 아래 줄 전체 폭 */}
          <div className="rounded-[12px] bg-[#f7f8fa] px-4 py-3 sm:col-span-3">
            <p className="text-[13px] text-[#868b94]">달마다 낸 금액</p>
            {byMonth.length === 0 ? (
              <p className="mt-1 text-[14px] text-[#868b94]">결제 기록 없음</p>
            ) : (
              <>
                <ul className="mt-1 grid grid-cols-1 gap-x-8 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3">
                  {shownMonths.map(([m, { sum, count }]) => (
                    <li key={m} className="flex items-baseline justify-between gap-2 tabular-nums">
                      <span className="text-[14px] text-[#4d5159]">
                        {m.slice(0, 4)}년 {Number(m.slice(5))}월 <span className="text-[12px] text-[#868b94]">{count}건</span>
                      </span>
                      <span className="text-[17px] font-bold text-[#1d1d1f]">{won(sum)}</span>
                    </li>
                  ))}
                </ul>
                {byMonth.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllMonths((v) => !v)}
                    className="mt-1 text-[12px] font-semibold text-[#1b64da]"
                  >
                    {showAllMonths ? "최근 6개월만 보기" : `전체 ${byMonth.length}개월 보기`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-black/5">
        {items.map((r) => (
          <RecurringCard
            key={r.id}
            r={r}
            today={today}
            onChange={(patch) => update((list) => list.map((x) => (x.id === r.id ? { ...x, ...patch } : x)))}
            onDelete={() => update((list) => list.filter((x) => x.id !== r.id))}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          update((list) => [
            ...list,
            {
              id: nextId++,
              name: "",
              cycle: "monthly",
              month: Number(today.slice(5, 7)),
              day: Number(today.slice(8, 10)),
              year: Number(today.slice(0, 4)),
              currency: "KRW",
              base: 0,
              memo: "",
              start: "",
              autoUntil: "",
              payments: [],
            },
          ])
        }
        className={`${smallButton} mt-2`}
      >
        + 정기 결제 추가
      </button>
      <p className="mt-3 text-[12px] text-[#868b94]">
        한 달로 치면: 1년 비용은 ÷ 12, 한 번 낸 비용은 빼고, 달러 항목은 마지막으로 적은 원화 금액으로 계산해요.
      </p>
    </section>
  );
}
