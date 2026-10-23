import { notFound } from "next/navigation";
import { getAllPosts, getPostFresh } from "@/lib/posts";
import AdminPostForm from "@/components/AdminPostForm";

type PageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export default async function AdminEditPage({ params }: PageProps) {
  const { slug } = await params;
  // 수정 화면은 캐시가 아닌 DB의 최신 내용으로 연다 (예전 내용으로 덮어쓰기 방지)
  const post = await getPostFresh(slug);

  if (!post) {
    notFound();
  }

  // CTA "다른 글 추천"에서 고를 글 목록 (지금 수정하는 글은 제외)
  const postOptions = (await getAllPosts())
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ slug: p.slug, title: p.seoTitle }));

  return (
    <AdminPostForm
      mode="edit"
      initialPost={post}
      postOptions={postOptions}
      authorName={post.authorName}
    />
  );
}