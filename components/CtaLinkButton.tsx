"use client";

import { sendGAEvent } from "@next/third-parties/google";

// CTA 링크 버튼. 누르면 GA4에 "cta_click" 이벤트를 보낸다.
// GA4 측정 ID가 없으면(GA 미연결) 이벤트는 아무 일도 하지 않는다.
export default function CtaLinkButton({
  href,
  label,
  postSlug,
}: {
  href: string;
  label: string;
  postSlug: string;
}) {
  // 내 사이트 주소(/...)는 같은 탭, 외부 주소는 새 탭으로 연다.
  const isExternal = !href.startsWith("/");

  return (
    <a
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() =>
        sendGAEvent("event", "cta_click", { post_slug: postSlug, cta_url: href })
      }
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-[#1d1d1f] transition hover:opacity-90"
    >
      {label} →
    </a>
  );
}
