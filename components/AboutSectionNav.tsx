"use client";

import { useEffect, useState } from "react";

// 소개 페이지 상단에 붙어 다니는 섹션 메뉴.
// 누르면 해당 섹션으로 이동하고, 스크롤 위치에 따라 지금 보고 있는 섹션이 강조된다.
export default function AboutSectionNav({
  sections,
}: {
  sections: { id: string; label: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    // 시작 위치가 화면 위쪽(메뉴 바로 아래)을 지난 섹션 중 마지막 것을 "지금 보는 섹션"으로 본다.
    // 화면 높이와 상관없이 동작해서 작은 창이나 모바일에서도 정확하다.
    function update() {
      let current = sections[0]?.id;
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActive(current);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [sections]);

  return (
    <nav className="sticky top-3 z-20 mx-auto w-fit max-w-[calc(100%-32px)] overflow-x-auto rounded-full border border-black/5 bg-white/90 p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur">
      <ul className="flex items-center gap-1">
        {sections.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-bold transition-colors md:px-5 ${
                active === id
                  ? "bg-[#191f28] text-white"
                  : "text-[#8b95a1] hover:text-[#191f28]"
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
