import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import DeletePostButton from "@/components/DeletePostButton";

export default async function AdminPostsPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto max-w-[860px] px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#1d1d1f]">글 목록</h1>
          <Link
            href="/admin"
            className="rounded-full bg-[#1d1d1f] px-5 py-2 text-[14px] font-medium text-white hover:opacity-90"
          >
            새 글 작성
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="text-[15px] text-[#6e6e73]">아직 작성된 글이 없어요.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="flex items-center justify-between gap-4 rounded-[16px] bg-white px-5 py-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[13px] font-medium text-[#6e6e73]">
                    {post.eyebrow} · {post.date}
                  </p>
                  <p className="truncate text-[16px] font-bold text-[#1d1d1f]">
                    {post.title}
                  </p>
                  <p className="truncate text-[12px] text-[#8e8e93]">
                    /news/{post.slug}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/edit/${post.slug}`}
                    className="rounded-lg border border-black/10 bg-white px-4 py-2 text-[14px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]"
                  >
                    수정
                  </Link>
                  <DeletePostButton slug={post.slug} title={post.title} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}