"use client";

import { useState } from "react";
import Link from "next/link";
import { submitInquiry } from "@/app/contact/actions";
import {
  INQUIRY_CONTENT_MAX,
  INQUIRY_TYPES,
  checkInquiry,
} from "@/lib/inquiry";
import { CONTACT_HOURS } from "@/lib/site";

const inputClass =
  "w-full rounded-[10px] border border-[#dcdee3] bg-white px-4 py-3 text-[15px] text-[#212124] placeholder:text-[#adb1ba] focus:border-[#212124] focus:outline-none";

export default function ContactForm() {
  const [type, setType] = useState("");
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

      <div>
        <label htmlFor="inquiry-email" className="mb-2 block text-[15px] font-semibold text-[#212124]">
          답장받을 이메일
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
          placeholder="궁금한 점이나 제안을 자유롭게 적어주세요."
          className={`${inputClass} resize-y leading-[1.7]`}
        />
        <p className="mt-1 text-right text-[13px] text-[#868b94]">
          {content.trim().length}/{INQUIRY_CONTENT_MAX}
        </p>
      </div>

      {/* 스팸 방지: 사람에게는 보이지 않는 칸 (자동 프로그램만 채운다) */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          웹사이트
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      {/* 개인정보 수집·이용 동의 (개인정보 보호법: 수집 항목·목적·보유 기간을 알리고 동의를 받는다) */}
      <div className="rounded-[12px] bg-[#f2f3f6] p-5 text-[14px] leading-[1.7] text-[#4d5159]">
        <p className="font-semibold text-[#212124]">개인정보 수집·이용 안내</p>
        <ul className="mt-2 list-disc pl-5">
          <li>수집 항목: 이메일 주소, 문의 유형, 문의 내용</li>
          <li>이용 목적: 문의 확인 및 답변</li>
          <li>보유 기간: 문의 처리 완료 후 지체 없이 파기 (관련 법령에 따라 보관이 필요한 경우 해당 기간)</li>
        </ul>
        <p className="mt-2">
          동의하지 않을 수 있으며, 이 경우 문의 접수가 어려워요. 자세한 내용은{" "}
          <Link href="/privacy" className="underline">
            개인정보처리방침
          </Link>
          을 확인해주세요.
        </p>
        <label className="mt-4 flex cursor-pointer items-center gap-2 font-semibold text-[#212124]">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-5 w-5 accent-[#212124]"
          />
          개인정보 수집·이용에 동의합니다 (필수)
        </label>
      </div>

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
