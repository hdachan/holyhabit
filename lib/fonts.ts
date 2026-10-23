import localFont from "next/font/local";

// 사이트 전체 글씨체: 페이퍼로지(Paperlogy). 한글·영어·숫자 모두 이 글씨체로 통일한다.
// 파일은 lib/fonts/에 직접 넣어 두어(외부 서버에 의존하지 않음) 우리 사이트에서 함께 내려간다.
// 사이트에서 쓰는 굵기만 넣었다: 400 보통 · 500 font-medium · 600 font-semibold · 700 font-bold · 800 font-extrabold
export const paperlogy = localFont({
  src: [
    { path: "./fonts/Paperlogy-4Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Paperlogy-5Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Paperlogy-6SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Paperlogy-7Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Paperlogy-8ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-paperlogy",
  display: "swap",
  // 한글 글씨체라 굵기마다 약 160KB. 미리 다 받지 않고, 페이지에서 실제로 쓰는 굵기만 받게 한다.
  preload: false,
});
