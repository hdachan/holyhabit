import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminPostList, type AdminPostRow } from "@/lib/admin-posts";
import DeletePostButton from "@/components/DeletePostButton";
import { postPath } from "@/lib/site";

type PageProps = {
  // ?author=all | 작성자 id. 없으면 "내 글"
  searchParams: Promise<{ author?: string }>;
};

// 관리자 화면은 서버(UTC)에서 그려지므로 한국 시간으로 명시해서 표시한다.
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
});
const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// 관리자 첫 화면: 글 목록. 작성자별로 나눠 보고, 글 보기·수정·삭제로 이동한다.
export default async function AdminPage({ searchParams }: PageProps) {
  const user = await requireAdmin();
  const { posts, authors } = await getAdminPostList();
  const { author: filter } = await searchParams;

  // 탭: 내 글(기본) → 다른 작성자들 → 전체
  const tabs = [
    { key: "", label: "내 글", match: (p: AdminPostRow) => p.authorId === user.id },
    ...authors
      .filter((a) => a.id !== user.id)
      .map((a) => ({ key: a.id, label: a.name, match: (p: AdminPostRow) => p.authorId === a.id })),
    { key: "all", label: "전체", match: () => true },
  ];
  const current = tabs.find((t) => t.key === (filter ?? "")) ?? tabs[0];
  const shown = posts.filter(current.match);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto max-w-[860px] px-6 py-16">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#1d1d1f]">글 목록</h1>
          <Link
            href="/admin/new"
            className="rounded-full bg-[#1d1d1f] px-5 py-2 text-[14px] font-medium text-white hover:opacity-90"
          >
            새 글 쓰기
          </Link>
        </div>

        {/* 작성자별 탭 */}
        <nav className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.key || "mine"}
              href={tab.key ? `/admin?author=${tab.key}` : "/admin"}
              className={`rounded-full px-4 py-1.5 text-[14px] font-medium ${
                tab === current
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-white text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              {tab.label} {posts.filter(tab.match).length}
            </Link>
          ))}
        </nav>

        {shown.length === 0 ? (
          <p className="text-[15px] text-[#6e6e73]">
            {current.key === "" ? "아직 내가 쓴 글이 없어요." : "글이 없어요."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map((post) => (
              <div key={post.slug} className="rounded-[16px] bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[13px] font-medium text-[#6e6e73]">
                      {post.eyebrow} · {post.authorName} · {dateFormatter.format(new Date(post.createdAt))}
                    </p>
                    <p className="truncate text-[16px] font-bold text-[#1d1d1f]">{post.title}</p>
                    <p className="truncate text-[12px] text-[#8e8e93]">{postPath(post.slug)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={postPath(post.slug)}
                      target="_blank"
                      className="rounded-lg px-3 py-2 text-[14px] font-medium text-[#6e6e73] hover:text-[#1d1d1f]"
                    >
                      보기
                    </Link>
                    <Link
                      href={`/admin/edit/${post.slug}`}
                      className="rounded-lg border border-black/10 bg-white px-4 py-2 text-[14px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]"
                    >
                      수정
                    </Link>
                    <DeletePostButton slug={post.slug} title={post.title} />
                  </div>
                </div>

                {/* 수정 기록: 마지막 수정을 보여주고, 누르면 전체 기록을 펼친다 */}
                {post.edits.length > 0 && (
                  <details className="mt-3 border-t border-black/5 pt-2 text-[12px] text-[#6e6e73]">
                    <summary className="cursor-pointer select-none hover:text-[#1d1d1f]">
                      마지막 수정 {post.edits[0].editorName} ·{" "}
                      {dateTimeFormatter.format(new Date(post.edits[0].editedAt))}
                      {post.edits.length > 1 && ` (총 ${post.edits.length}번 수정)`}
                    </summary>
                    <ul className="mt-2 flex flex-col gap-1 pl-4">
                      {post.edits.map((edit) => (
                        <li key={edit.editedAt}>
                          {dateTimeFormatter.format(new Date(edit.editedAt))} · {edit.editorName}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
