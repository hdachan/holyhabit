"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { submitInquiry } from "@/app/contact/actions";
import { DELETE_TYPE, INQUIRY_CONTENT_MAX, INQUIRY_TYPES, checkInquiry } from "@/lib/inquiry";
import { CONTACT_HOURS } from "@/lib/site";
import ConsentBox, { HoneypotField, inputClass } from "@/components/ConsentBox";

// 주소가 /contact#delete 이면 "계정 삭제 요청"을 미리 골라 둔다 (구글 플레이에 등록하는 계정 삭제 주소).
function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const isDeleteHash = () => window.location.hash === "#delete";
const notDeleteHash = () => false;

// 문의하기 탭: 양식으로 한 번 보내고 끝. 답장은 이메일로 드린다.
export default function ContactForm() {
  const deleteHash = useSyncExternalStore(subscribeHash, isDeleteHash, notDeleteHash);
  const [picked, setPicked] = useState("");
  const type = picked || (deleteHash ? DELETE_TYPE : "");
  const setType = setPicked;
  const isDelete = type === DELETE_TYPE;
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
    const problem = checkInquiry({ type, email, content, agreed });
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSending(true);
    try {
      const result = await submitInquiry({ type, email, content, agreed, website, openedAt });
      if ("error" in result) setError(result.error);
      else setDone(true);
    } catch {
      setError("문의를 보내지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[20px] bg-[#f2f3f6] px-6 py-12 text-center">
        <p className="text-[20px] font-bold text-[#212124]">문의가 접수됐어요</p>
        <p className="mt-3 text-[15px] leading-[1.7] text-[#4d5159]">
          {email.trim()}로 답장을 드릴게요.
          <br />
          {CONTACT_HOURS}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-[10px] bg-[#212124] px-6 py-3 text-[15px] font-semibold text-white"
        >
          홈으로
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label htmlFor="inquiry-type" className="mb-2 block text-[15px] font-semibold text-[#212124]">
          문의 유형
        </label>
        <select
          id="inquiry-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            골라주세요
          </option>
          {INQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {isDelete && (
        <div className="rounded-[12px] bg-[#fff4ea] px-5 py-4 text-[14px] leading-[1.7] text-[#212124]">
          <p className="font-bold">HolyHabit 앱 계정 삭제 요청</p>
          <ul className="mt-2 list-disc pl-5 text-[#4d5159]">
            <li>앱에 로그인한 구글 계정 이메일을 아래에 적어주세요. 그 이메일로 본인 확인 후 삭제해 드려요.</li>
            <li>
              <b>삭제되는 것:</b> 계정 정보(이메일, 닉네임, 구글 식별자), 운동 기록, 걸음수, 캐릭터·배틀 기록, 골드·신발코인과
              아이템. 삭제 후에는 되살릴 수 없어요.
            </li>
            <li>
              <b>남는 것:</b> 법에 따라 보관해야 하는 기록만 정해진 기간 동안 보관 후 파기해요 (접속 기록 3개월, 소비자
              분쟁 기록 3년 등).
            </li>
            <li>앱이 있다면 앱 설정 &gt; 회원 탈퇴에서 바로 삭제할 수도 있어요.</li>
          </ul>
        </div>
      )}

      <div>
        <label htmlFor="inquiry-email" className="mb-2 block text-[15px] font-semibold text-[#212124]">
          {isDelete ? "앱에 로그인한 구글 계정 이메일" : "답장받을 이메일"}
        </label>
        <input
          id="inquiry-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="inquiry-content" className="mb-2 block text-[15px] font-semibold text-[#212124]">
          문의 내용
        </label>
        <textarea
          id="inquiry-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          maxLength={INQUIRY_CONTENT_MAX}
          placeholder={isDelete ? "앱 닉네임과 함께 삭제를 원한다고 적어주세요. (예: 닉네임 레오, 계정 삭제를 요청합니다)" : "궁금한 점이나 제안을 자유롭게 적어주세요."}
          className={`${inputClass} resize-y leading-[1.7]`}
        />
        <p className="mt-1 text-right text-[13px] text-[#868b94]">
          {content.trim().length}/{INQUIRY_CONTENT_MAX}
        </p>
      </div>

      <HoneypotField value={website} onChange={setWebsite} />
      <ConsentBox items="이메일 주소, 문의 유형, 문의 내용" agreed={agreed} onChange={setAgreed} />

      {error && <p className="text-[14px] text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="rounded-[10px] bg-[#212124] py-4 text-[16px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {sending ? "보내는 중..." : "문의 보내기"}
      </button>
    </form>
  );
}
