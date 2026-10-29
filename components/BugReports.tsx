"use client";

import { useCallback, useEffect, useState } from "react";
import BugReportForm from "@/components/BugReportForm";
import ChatThread from "@/components/ChatThread";
import { getBugMessages, getBugThread, getBugThreads, sendBugMessage } from "@/app/contact/actions";
import { BUG_CLOSED_NOTICE, isInquiryToken, type BugThreadSummary, type ChatMessage } from "@/lib/inquiry";
import { SITE_NAME } from "@/lib/site";

// 내가 만든 버그 제보 채팅방 열쇠 목록을 브라우저에 저장하는 이름.
// 같은 브라우저로 다시 오면 "내 버그 제보" 목록이 그대로 보인다.
const STORAGE_KEY = "holyhabit:bug-tokens";

function readTokens(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isInquiryToken) : [];
  } catch {
    return [];
  }
}
function writeTokens(tokens: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // 시크릿 창 등 저장이 막힌 브라우저: 채팅방 주소로만 다시 열 수 있다.
  }
}
/** 서버에서 내 버그 제보 목록 받기. 삭제된 채팅방은 브라우저 목록에서도 지운다. */
async function fetchThreads() {
  const tokens = readTokens();
  if (tokens.length === 0) return [];
  const list = await getBugThreads(tokens);
  writeTokens(tokens.filter((t) => list.some((thread) => thread.token === t)));
  return list;
}
function chatLink(token: string) {
  return `${window.location.origin}/contact#t=${token}`;
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

type View = { name: "list" } | { name: "new" } | { name: "chat"; token: string };
type Chat = { token: string; closed: boolean; messages: ChatMessage[] };

/**
 * 버그 제보 탭: 내 버그 제보 목록 → 채팅방.
 * 다른 기기에서는 "채팅방 주소"(/contact#t=열쇠)로 연다. 열쇠를 # 뒤에 두면
 * 서버 기록이나 방문 통계(GA)에 주소가 남지 않는다.
 */
export default function BugReports() {
  // null = 아직 불러오는 중
  const [threads, setThreads] = useState<BugThreadSummary[] | null>(null);
  const [view, setView] = useState<View>({ name: "list" });
  const [chat, setChat] = useState<Chat | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadThreads = useCallback(() => fetchThreads().then(setThreads), []);

  const openChat = useCallback(async (token: string) => {
    setView({ name: "chat", token });
    setChat(null);
    setNotice(null);
    const found = await getBugThread(token);
    if (found) setChat({ token, closed: found.closed, messages: found.messages });
    else {
      setNotice("이 채팅방은 삭제됐어요.");
      setView({ name: "list" });
    }
  }, []);

  // 처음 열 때: 채팅방 주소(#t=열쇠)로 들어왔으면 목록에 더하고 그 채팅방을 연다.
  useEffect(() => {
    const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("t");
    if (isInquiryToken(fromHash)) {
      const tokens = readTokens();
      if (!tokens.includes(fromHash)) writeTokens([fromHash, ...tokens]);
    }
    fetchThreads()
      .then((list) => {
        setThreads(list);
        if (isInquiryToken(fromHash) && list.some((t) => t.token === fromHash)) openChat(fromHash);
        else if (isInquiryToken(fromHash)) setNotice("이 채팅방은 삭제됐어요.");
      })
      .catch(() => {
        setThreads([]);
        setNotice("제보 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      });
  }, [openChat]);

  function backToList() {
    setView({ name: "list" });
    setChat(null);
    loadThreads().catch(() => {});
  }

  const chatToken = view.name === "chat" ? view.token : null;
  const fetchNew = useCallback(
    (afterId: number) => (chatToken ? getBugMessages(chatToken, afterId) : Promise.resolve(null)),
    [chatToken]
  );
  const send = useCallback((body: string) => sendBugMessage(chatToken ?? "", body), [chatToken]);
  const onGone = useCallback(() => {
    setNotice("이 채팅방은 삭제됐어요.");
    setView({ name: "list" });
    setChat(null);
    loadThreads().catch(() => {});
  }, [loadThreads]);

  async function copyLink(token: string) {
    try {
      await navigator.clipboard.writeText(chatLink(token));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("아래 주소를 복사해두세요.", chatLink(token));
    }
  }

  if (threads === null) {
    return <p className="py-16 text-center text-[15px] text-[#868b94]">불러오는 중...</p>;
  }

  const noticeBox = notice && (
    <p className="mb-6 rounded-[12px] bg-[#fff4ea] px-5 py-4 text-[14px] text-[#4d5159]">{notice}</p>
  );

  // 새 제보 쓰기 (보낸 제보가 하나도 없으면 바로 이 화면)
  if (view.name === "new" || (view.name === "list" && threads.length === 0)) {
    return (
      <>
        {noticeBox}
        <BugReportForm
          onCancel={threads.length > 0 ? backToList : undefined}
          onStarted={(token) => {
            writeTokens([token, ...readTokens()]);
            loadThreads().catch(() => {});
            openChat(token);
            // 양식 아래쪽(보내기 버튼)에 있던 화면을 채팅이 보이는 위치로 올린다.
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </>
    );
  }

  // 채팅방
  if (view.name === "chat") {
    return (
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={backToList} className="text-[14px] text-[#868b94] hover:text-[#212124]">
            ← 내 버그 제보
          </button>
          {chat && (
            <span
              className={`rounded-full px-2.5 py-1 text-[13px] font-semibold ${
                chat.closed ? "bg-[#e9ebee] text-[#6e6e73]" : "bg-[#e7f7ee] text-[#16a34a]"
              }`}
            >
              {chat.closed ? "해결 완료" : "진행 중"}
            </span>
          )}
        </div>

        {chat ? (
          <ChatThread
            key={chat.token}
            initialMessages={chat.messages}
            initialClosed={chat.closed}
            closedNotice={BUG_CLOSED_NOTICE}
            closedAction={
              <button
                type="button"
                onClick={() => setView({ name: "new" })}
                className="rounded-[10px] bg-[#212124] px-5 py-3 text-[15px] font-semibold text-white hover:opacity-90"
              >
                새 버그 제보
              </button>
            }
            me="user"
            partnerName={SITE_NAME}
            fetchNew={fetchNew}
            send={send}
            onGone={onGone}
          />
        ) : (
          <p className="py-16 text-center text-[15px] text-[#868b94]">채팅방을 여는 중...</p>
        )}

        <div className="mt-4 rounded-[12px] bg-[#f2f3f6] p-5 text-[14px] leading-[1.7] text-[#4d5159]">
          <p>답변은 이 채팅방에 올라와요. 이 브라우저에서는 다시 들어와도 &quot;내 버그 제보&quot;에 남아 있어요.</p>
          <p className="mt-2">
            다른 기기에서 보려면 채팅방 주소를 저장해두세요.
            <br />
            <span className="text-[13px] text-[#868b94]">
              주소를 아는 사람은 이 대화를 볼 수 있으니 다른 사람과 공유하지 마세요.
            </span>
          </p>
          <button
            type="button"
            onClick={() => copyLink(view.token)}
            className="mt-3 rounded-[10px] bg-white px-4 py-2 text-[14px] font-semibold text-[#212124] hover:bg-[#e9ebee]"
          >
            {copied ? "복사했어요 ✓" : "🔗 채팅방 주소 복사"}
          </button>
        </div>
      </div>
    );
  }

  // 내 버그 제보 목록
  return (
    <div>
      {noticeBox}
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-[17px] font-bold text-[#212124]">내 버그 제보</p>
        <button
          type="button"
          onClick={() => {
            setNotice(null);
            setView({ name: "new" });
          }}
          className="rounded-[10px] bg-[#212124] px-4 py-2 text-[14px] font-semibold text-white hover:opacity-90"
        >
          + 새 버그 제보
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {threads.map((t) => (
          <button
            key={t.token}
            type="button"
            onClick={() => openChat(t.token)}
            className="rounded-[16px] border border-[#e9ebee] bg-white px-5 py-4 text-left transition hover:bg-[#f7f8fa]"
          >
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#868b94]">
              <span
                className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${
                  t.closed ? "bg-[#e9ebee] text-[#6e6e73]" : "bg-[#e7f7ee] text-[#16a34a]"
                }`}
              >
                {t.closed ? "해결 완료" : "진행 중"}
              </span>
              {!t.closed && t.answered && (
                <span className="rounded-full bg-[#fff4ea] px-2 py-0.5 text-[12px] font-semibold text-[#e8893a]">
                  답변 도착
                </span>
              )}
              <span>{dateFormatter.format(new Date(t.lastMessageAt))}</span>
            </div>
            <p className="mt-2 truncate text-[15px] text-[#212124]">{t.preview}</p>
          </button>
        ))}
      </div>
      <p className="mt-4 text-[13px] text-[#868b94]">이 브라우저에서 보낸 제보만 보여요.</p>
    </div>
  );
}
