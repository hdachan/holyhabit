import localFont from "next/font/local";

// C:\Users\owner\holyhabit\lib\fonts\Helvetica.ttf 를 전역 폰트로 등록
export const helvetica = localFont({
  src: "./fonts/Helvetica.ttf",
  variable: "--font-helvetica",
  display: "swap",
});