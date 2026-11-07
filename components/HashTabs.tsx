"use client";

import { useState, useSyncExternalStore } from "react";

// 주소 # 으로 고를 수 있는 탭. 예: /privacy#web 으로 들어오면 "웹사이트" 탭이 열린다.
// 탭 내용은 모두 미리 그려 두고 고른 것만 보여준다 (검색엔진·인쇄에서도 내용이 빠지지 않게).
function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const getHash = () => window.location.hash.slice(1);
const getServerHash = () => "";

export default function HashTabs({
  tabs,
}: {
  // 첫 번째 탭이 기본으로 열린다
  tabs: { key: string; label: string; content: React.ReactNode }[];
}) {
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const [picked, setPicked] = useState<string | null>(null);
  const fromHash = tabs.some((t) => t.key === hash) ? hash : null;
  const active = picked ?? fromHash ?? tabs[0].key;

  function pick(key: string) {
    setPicked(key);
    // 주소도 바꿔서, 지금 보는 탭 주소를 그대로 복사해 쓸 수 있게 한다 (페이지 이동 없음)
    window.history.replaceState(null, "", `#${key}`);
  }

  return (
    <div>
      <div role="tablist" className="mb-6 flex gap-1 rounded-[12px] bg-[#e8e8ed] p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active === t.key}
            onClick={() => pick(t.key)}
            className={`flex-1 rounded-[10px] py-3 text-[15px] font-semibold transition ${
              active === t.key ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#6e6e73] hover:text-[#1d1d1f]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.key} role="tabpanel" hidden={active !== t.key}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
