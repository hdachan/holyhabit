import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/posts";
import AdminPostForm from "@/components/AdminPostForm";

type PageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export default async function AdminEditPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // CTA "다른 글 추천"에서 고를 글 목록 (지금 수정하는 글은 제외)
  const postOptions = (await getAllPosts())
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ slug: p.slug, title: p.seoTitle }));

  return (
    <AdminPostForm mode="edit" initialPost={post} postOptions={postOptions} />
  );
}