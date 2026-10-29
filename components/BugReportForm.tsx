"use client";

import { useState } from "react";
import { submitBugReport } from "@/app/contact/actions";
import { INQUIRY_CONTENT_MAX, checkBug } from "@/lib/inquiry";
import ConsentBox, { HoneypotField, inputClass } from "@/components/ConsentBox";

// 새 버그 제보 양식. 보내면 채팅방이 만들어지고 onStarted로 채팅방 열쇠를 넘긴다.
export default function BugReportForm({
  onStarted,
  onCancel,
}: {
  onStarted: (token: string) => void;
  // 이미 보낸 제보가 있을 때만: 목록으로 돌아가기
  onCancel?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [website, setWebsite] = useState(""); // 스팸 방지용 숨은 칸
  const [openedAt] = useState(() => Date.now());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problem = checkBug({ email, content, agreed });
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSending(true);
    try {
      const result = await submitBugReport({ email, content, agreed, website, openedAt });
      if ("error" in result) setError(result.error);
      // token이 없으면 스팸으로 걸러진 것: 접수 안내만 보여준다.
      else if (result.token) onStarted(result.token);
      else setDone(true);
    } catch {
      setError("제보를 보내지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[20px] bg-[#f2f3f6] px-6 py-12 text-center">
        <p className="text-[20px] font-bold text-[#212124]">제보가 접수됐어요</p>
        <p className="mt-3 text-[15px] text-[#4d5159]">알려주셔서 고마워요.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="self-start text-[14px] text-[#868b94] hover:text-[#212124]"
        >
          ← 내 버그 제보
        </button>
      )}

      <div>
        <label htmlFor="bug-content" className="mb-2 block text-[15px] font-semibold text-[#212124]">
          어떤 문제가 있었나요?
        </label>
        <textarea
          id="bug-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={7}
          maxLength={INQUIRY_CONTENT_MAX}
          placeholder={"어느 화면에서, 무엇을 했을 때, 어떻게 됐는지 적어주세요.\n예) 콘텐츠 화면에서 '오운완' 글을 눌렀는데 사진이 안 보여요. (아이폰, 사파리)"}
          className={`${inputClass} resize-y leading-[1.7]`}
        />
        <p className="mt-1 text-right text-[13px] text-[#868b94]">
          {content.trim().length}/{INQUIRY_CONTENT_MAX}
        </p>
      </div>

      <div>
        <label htmlFor="bug-email" className="mb-2 block text-[15px] font-semibold text-[#212124]">
          이메일 <span className="font-normal text-[#868b94]">(선택)</span>
        </label>
        <input
          id="bug-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          autoComplete="email"
          className={inputClass}
        />
        <p className="mt-1 text-[13px] text-[#868b94]">
          답변은 채팅방에 올라와요. 이메일을 남기면 필요할 때 메일로도 연락드릴 수 있어요.
        </p>
      </div>

      <HoneypotField value={website} onChange={setWebsite} />
      <ConsentBox
        items="제보 내용(이후 주고받는 대화 포함), 이메일 주소(적은 경우)"
        agreed={agreed}
        onChange={setAgreed}
      />

      {error && <p className="text-[14px] text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="rounded-[10px] bg-[#212124] py-4 text-[16px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {sending ? "보내는 중..." : "제보하고 채팅 시작하기"}
      </button>
    </form>
  );
}
