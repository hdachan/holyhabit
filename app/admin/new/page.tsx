import AdminPostForm from "@/components/AdminPostForm";
import { getAllPosts } from "@/lib/posts";
import { requireAdmin } from "@/lib/auth";
import { getAuthorById } from "@/lib/authors-db";

export default async function AdminNewPostPage() {
  // CTA "다른 글 추천"에서 고를 글 목록
  const posts = await getAllPosts();
  const postOptions = posts.map((p) => ({ slug: p.slug, title: p.seoTitle }));
  // 새 글의 작성자 = 지금 로그인한 계정
  const author = await getAuthorById((await requireAdmin()).id);

  return (
    <AdminPostForm
      mode="create"
      postOptions={postOptions}
      authorName={author?.name ?? null}
    />
  );
}
