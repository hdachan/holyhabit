import { unstable_cache } from "next/cache";
import { createSupabaseClient } from "./supabase";

export type Post = {
  slug: string;
  eyebrow: string;
  title: string;
  date: string; // 화면 표시용으로 가공된 날짜
  imageUrl: string | null;
  body: string; // Tiptap 에디터에서 나온 HTML
  excerpt: string; // 카드 미리보기용 — 본문에서 태그를 뺀 짧은 요약
};

function stripHtmlToExcerpt(html: string, maxLength = 120) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength
    ? `${text.slice(0, maxLength).trim()}...`
    : text;
}

function formatKoreanDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function toPost(row: {
  slug: string;
  eyebrow: string;
  title: string;
  body: string;
  image_url: string | null;
  created_at: string;
}): Post {
  return {
    slug: row.slug,
    eyebrow: row.eyebrow,
    title: row.title,
    date: formatKoreanDate(row.created_at),
    imageUrl: row.image_url,
    body: row.body,
    excerpt: stripHtmlToExcerpt(row.body),
  };
}

/**
 * 글 목록을 가져옵니다. Supabase 조회는 이 함수 안에서만 일어나고
 * 결과는 "posts" 태그로 캐싱됩니다. 방문자가 아무리 많아도
 * revalidateTag("posts")가 호출되기 전까지는 여기서 추가 쿼리가 나가지 않아요.
 * (관리자 페이지에서 글을 쓸 때 그 함수가 호출됩니다.)
 */
export const getAllPosts = unstable_cache(
  async (): Promise<Post[]> => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase posts fetch error:", error.message);
      return [];
    }

    return (data ?? []).map(toPost);
  },
  ["posts"],
  { tags: ["posts"] }
);

export async function getPost(slug: string): Promise<Post | undefined> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug);
}

export async function getRelatedPosts(
  slug: string,
  count = 3
): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter((p) => p.slug !== slug).slice(0, count);
}