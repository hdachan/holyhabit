import { requireAdmin } from "@/lib/auth";
import { getAuthorById } from "@/lib/authors-db";
import AuthorProfileForm from "@/components/AuthorProfileForm";

// 내 작성자 정보: 로그인한 관리자 계정마다 따로 저장된다.
export default async function AdminProfilePage() {
  const user = await requireAdmin();
  const author = await getAuthorById(user.id);

  return <AuthorProfileForm initial={author} />;
}
