import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_PATH } from "@/lib/site";

// layout의 제목 틀("%s | holyhabit")이 적용되어 "페이지를 찾을 수 없어요 | holyhabit"이 된다.
// <title>을 본문에 직접 넣으면 기본 제목과 두 개가 겹쳐 나가서 metadata로 지정한다.
export const metadata: Metadata = {
  title: "페이지를 찾을 수 없어요",
};

// 없는 주소로 들어왔을 때 보여주는 화면(404).
// 검색 노출과는 상관없지만(Next가 noindex를 자동으로 붙인다), 잘못 들어온 방문자가 떠나지 않게 콘텐츠로 안내한다.
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-[#f5f5f7] px-6 py-28 text-center">
      <p className="text-[14px] font-semibold tracking-[0.08em] text-[#8e8e93]">404</p>
      <h1 className="mt-3 text-[28px] font-bold text-[#1d1d1f] md:text-[36px]">
        페이지를 찾을 수 없어요
      </h1>
      <p className="mt-3 text-[16px] text-[#6e6e73]">
        주소가 바뀌었거나 삭제된 페이지예요.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={BLOG_PATH}
          className="rounded-full bg-[#1d1d1f] px-6 py-3 text-[15px] font-medium text-white hover:opacity-90"
        >
          콘텐츠 보러 가기
        </Link>
        <Link
          href="/"
          className="rounded-full border border-black/10 bg-white px-6 py-3 text-[15px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
