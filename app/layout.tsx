import type { Metadata } from "next";
import "./globals.css";
import { helvetica } from "@/lib/fonts";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "홀리해빗",
  description: "홀리해빗 뉴스룸",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${helvetica.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-helvetica)]">
        <Header />
        {children}
      </body>
    </html>
  );
}