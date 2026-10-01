import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import PostCarousel from "@/components/PostCarousel";

// 홈 전용 메타. 제목·설명은 layout 기본값을 그대로 쓰고 정본 주소만 지정한다.
// canonical을 layout이 아닌 여기에 두는 이유: layout에 두면 모든 하위 페이지가 상속받아
// 글 페이지까지 "정본은 홈"이라고 선언하게 된다.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// holyhabit 홈 — Supabase의 posts 테이블에서 글을 가져옵니다.
// getAllPosts()는 캐싱되어 있어서, 관리자가 새 글을 쓰기 전까지는
// 방문자가 아무리 많아도 Supabase에 추가 쿼리가 나가지 않습니다.
// (자세한 내용은 lib/posts.ts 참고)
export default async function Page() {
  const posts = await getAllPosts();
  return (
    <div className="min-h-screen bg-white">
      {/* 본문 배경 — 연한 그레이 */}
      <main className="bg-[#f5f5f7]">
        <div className="mx-auto max-w-[1800px] px-6 py-10 md:px-10">
          {/* 페이지 주제를 나타내는 h1. 디자인상 화면엔 없으므로 sr-only로 숨기되
              검색엔진과 스크린리더는 읽을 수 있게 한다. */}
          <h1 className="sr-only">holyhabit 홀리해빗 소식</h1>
          <PostCarousel posts={posts} />
        </div>
      </main>
    </div>
  );
}