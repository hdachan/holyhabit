import { getAllPosts } from "@/lib/posts";
import PostCarousel from "@/components/PostCarousel";
// holyhabit Newsroom — Supabase의 posts 테이블에서 글을 가져옵니다.
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
          <PostCarousel posts={posts} />
        </div>
      </main>
    </div>
  );
}