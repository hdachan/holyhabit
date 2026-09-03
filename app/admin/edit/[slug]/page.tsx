import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";
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

  return <AdminPostForm mode="edit" initialPost={post} />;
}