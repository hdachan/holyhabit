"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MESSAGE_MAX, pollDelay, type ChatMessage, type ChatPoll } from "@/lib/inquiry";

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * 1:1 문의 채팅 화면. 방문자 화면(문의하기)과 관리자 화면(문의함)이 같이 쓴다.
 * 실시간 연결 대신, 화면을 새로고침하지 않고 새 메시지만 주기적으로 확인한다(lib/inquiry.ts의 pollDelay).
 * 다른 탭을 보고 있거나 화면이 꺼져 있으면 확인을 멈추고, 돌아오면 바로 한 번 확인한다.
 * 상담이 종료되면 입력칸 대신 안내를 보여준다. 다시 열릴 수 있어서 종료 후에도 (느리게) 계속 확인한다.
 */
export default function ChatThread({
  initialMessages,
  initialClosed,
  closedNotice,
  closedAction,
  me,
  partnerName,
  fetchNew,
  send,
  onGone,
}: {
  initialMessages: ChatMessage[];
  initialClosed: boolean;
  // 종료됐을 때 입력칸 자리에 보여줄 안내와 버튼
  closedNotice: string;
  closedAction?: React.ReactNode;
  // 이 화면을 보는 사람. 내 메시지는 오른쪽, 상대 메시지는 왼쪽에 놓인다.
  me: "user" | "admin";
  // 상대 말풍선 위에 표시할 이름
  partnerName: string;
  fetchNew: (afterId: number) => Promise<ChatPoll | null>;
  send: (body: string) => Promise<{ message: ChatMessage } | { error: string }>;
  // 대화방이 삭제된 것을 알았을 때
  onGone?: () => void;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [closed, setClosed] = useState(initialClosed);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef(initialMessages.at(-1)?.id ?? 0);
  // 마지막으로 메시지가 오간 시각. 화면을 연 순간부터 센다(아래 확인 effect에서 채움).
  const lastActivityRef = useRef(0);

  const append = useCallback((incoming: ChatMessage[]) => {
    const fresh = incoming.filter((m) => m.id > lastIdRef.current);
    if (fresh.length === 0) return;
    lastIdRef.current = fresh[fresh.length - 1].id;
    lastActivityRef.current = Date.now();
    setMessages((prev) => [...prev, ...fresh]);
  }, []);

  // 새 메시지 확인 (점점 느리게)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    if (lastActivityRef.current === 0) lastActivityRef.current = Date.now();

    async function check() {
      if (document.hidden) return;
      try {
        const result = await fetchNew(lastIdRef.current);
        if (result === null) {
          stopped = true;
          onGone?.();
          return;
        }
        append(result.messages);
        setClosed(result.closed);
      } catch {
        // 잠깐 연결이 끊긴 경우: 다음 확인 때 다시 시도한다.
      }
    }

    function schedule() {
      if (stopped) return;
      timer = setTimeout(async () => {
        await check();
        schedule();
      }, pollDelay(Date.now() - lastActivityRef.current));
    }

    function onVisible() {
      if (document.hidden) return;
      clearTimeout(timer);
      check().then(schedule);
    }

    schedule();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchNew, append, onGone]);

  // 새 메시지가 붙으면 맨 아래로
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      const result = await send(text);
      if ("error" in result) {
        setError(result.error);
        // 보내는 사이에 종료된 경우: 바로 확인해서 안내로 바꾼다.
        const latest = await fetchNew(lastIdRef.current);
        if (latest) {
          append(latest.messages);
          setClosed(latest.closed);
          if (latest.closed) setError(null);
        }
      } else {
        setDraft("");
        append([result.message]);
      }
    } catch {
      setError("보내지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] border border-[#e9ebee] bg-white">
      <div ref={listRef} className="flex h-[440px] flex-col gap-4 overflow-y-auto bg-[#f7f8fa] px-4 py-5 md:px-6">
        {messages.map((m) => {
          const mine = m.sender === me;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              {!mine && <p className="mb-1 text-[13px] font-semibold text-[#4d5159]">{partnerName}</p>}
              <p
                className={`max-w-[80%] whitespace-pre-wrap break-words rounded-[16px] px-4 py-3 text-[15px] leading-[1.6] ${
                  mine ? "rounded-tr-[4px] bg-[#212124] text-white" : "rounded-tl-[4px] bg-white text-[#212124] shadow-sm"
                }`}
              >
                {m.body}
              </p>
              <p className="mt-1 text-[12px] text-[#868b94]">{timeFormatter.format(new Date(m.createdAt))}</p>
            </div>
          );
        })}
      </div>

      {closed ? (
        <div className="flex flex-col items-center gap-3 border-t border-[#e9ebee] px-4 py-5 text-center">
          <p className="text-[14px] text-[#4d5159]">{closedNotice}</p>
          {closedAction}
        </div>
      ) : (
      <form onSubmit={handleSend} className="border-t border-[#e9ebee] p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Enter = 보내기, Shift+Enter = 줄바꿈 (한글 조합 중에는 보내지 않는다)
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={2}
            maxLength={MESSAGE_MAX}
            placeholder="메시지를 입력하세요 (Shift+Enter 줄바꿈)"
            aria-label="메시지 입력"
            className="min-h-[48px] flex-1 resize-none rounded-[10px] border border-[#dcdee3] px-4 py-3 text-[15px] text-[#212124] placeholder:text-[#adb1ba] focus:border-[#212124] focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="h-[48px] shrink-0 rounded-[10px] bg-[#212124] px-5 text-[15px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {sending ? "보내는 중" : "보내기"}
          </button>
        </div>
        {error && <p className="mt-2 text-[14px] text-red-600">{error}</p>}
      </form>
      )}
    </div>
  );
}
