import AdminPostForm from "@/components/AdminPostForm";
import { getAllPosts } from "@/lib/posts";

export default async function AdminNewPostPage() {
  // CTA "다른 글 추천"에서 고를 글 목록
  const posts = await getAllPosts();
  const postOptions = posts.map((p) => ({ slug: p.slug, title: p.seoTitle }));

  return <AdminPostForm mode="create" postOptions={postOptions} />;
}
