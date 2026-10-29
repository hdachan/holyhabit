"use client";

import { useState, useSyncExternalStore } from "react";
import ContactForm from "@/components/ContactForm";
import BugReports from "@/components/BugReports";

type Tab = "inquiry" | "bug";

// 주소 # 부분 읽기. /contact#bug 이나 채팅방 주소(/contact#t=열쇠)로 들어오면 버그 제보 탭을 연다.
function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const getHash = () => window.location.hash;
const getServerHash = () => "";

// 문의하기 화면의 탭: 문의하기(양식) / 버그 제보(채팅)
export default function ContactTabs() {
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const [picked, setPicked] = useState<Tab | null>(null);
  const tab: Tab = picked ?? (hash === "#bug" || hash.startsWith("#t=") ? "bug" : "inquiry");

  const tabs: { key: Tab; label: string }[] = [
    { key: "inquiry", label: "문의하기" },
    { key: "bug", label: "버그 제보" },
  ];

  return (
    <div>
      <div role="tablist" className="mb-8 flex gap-1 rounded-[12px] bg-[#f2f3f6] p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setPicked(t.key)}
            className={`flex-1 rounded-[10px] py-3 text-[15px] font-semibold transition ${
              tab === t.key ? "bg-white text-[#212124] shadow-sm" : "text-[#868b94] hover:text-[#212124]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "inquiry" ? (
        <>
          <p className="mb-6 text-[14px] text-[#868b94]">궁금한 점이나 제안을 남겨주시면 이메일로 답장을 드려요.</p>
          <ContactForm />
        </>
      ) : (
        <>
          <p className="mb-6 text-[14px] text-[#868b94]">
            사이트를 쓰다 이상한 점을 발견하면 알려주세요. 채팅으로 확인하고 답변드려요.
          </p>
          <BugReports />
        </>
      )}
    </div>
  );
}
