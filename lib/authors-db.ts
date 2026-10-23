import { createSupabaseAdminClient } from "./supabase";
import type { Author } from "./authors";

// 서버 전용: service role 키를 쓰므로 브라우저 쪽 코드(AuthorProfileForm 등)에서 가져오면 안 된다.
/** 이 계정의 작성자 정보. 아직 입력하지 않았으면 null. (관리자 화면 전용) */
export async function getAuthorById(id: string): Promise<Author | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("authors")
    .select("name, bio")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? { name: data.name, bio: data.bio ?? "" } : null;
}
