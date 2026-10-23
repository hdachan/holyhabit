import { createSupabaseAdminClient } from "./supabase";
import { AUTHOR_NAME } from "./site";

// 관리자 글 목록 전용 조회. 방문자 화면용 getAllPosts(캐시)와 달리
// 작성자 id와 수정 기록(post_edits)까지 매번 새로 가져온다. (관리자 화면이라 캐시하지 않는다)
// 서버 전용: service role 키를 쓴다.

export type AdminPostEdit = { editorName: string; editedAt: string };

export type AdminPostRow = {
  slug: string;
  title: string;
  eyebrow: string;
  createdAt: string;
  authorId: string | null;
  authorName: string;
  edits: AdminPostEdit[]; // 최근 수정이 앞
};

export type AdminAuthorOption = { id: string; name: string };

export async function getAdminPostList(): Promise<{
  posts: AdminPostRow[];
  authors: AdminAuthorOption[];
}> {
  const supabase = createSupabaseAdminClient();
  const [postsRes, authorsRes] = await Promise.all([
    supabase
      .from("posts")
      .select(
        "slug, title, eyebrow, created_at, author_id, author:authors(name), edits:post_edits(edited_at, editor:authors(name))"
      )
      .order("created_at", { ascending: false }),
    supabase.from("authors").select("id, name").order("name"),
  ]);
  if (postsRes.error) throw new Error(postsRes.error.message);
  if (authorsRes.error) throw new Error(authorsRes.error.message);

  type Row = {
    slug: string;
    title: string;
    eyebrow: string;
    created_at: string;
    author_id: string | null;
    author: { name: string } | null;
    edits: { edited_at: string; editor: { name: string } | null }[] | null;
  };

  const posts = (postsRes.data as unknown as Row[]).map((row) => ({
    slug: row.slug,
    title: row.title,
    eyebrow: row.eyebrow,
    createdAt: row.created_at,
    authorId: row.author_id,
    // 작성자가 연결되지 않은 글은 방문자 화면과 같은 기본 작성자로 표시
    authorName: row.author?.name || AUTHOR_NAME,
    edits: (row.edits ?? [])
      .map((e) => ({ editorName: e.editor?.name ?? "알 수 없음", editedAt: e.edited_at }))
      .sort((a, b) => b.editedAt.localeCompare(a.editedAt)),
  }));

  return { posts, authors: authorsRes.data ?? [] };
}
