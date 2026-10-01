import { unstable_cache } from "next/cache";
import { createSupabaseClient } from "./supabase";

export type Post = {
  slug: string;
  eyebrow: string;
  title: string; // 화면 표시용 (디자인상 줄바꿈 포함)
  // 메타 태그용 한 줄 제목. title의 줄바꿈이 <title>·OG 제목에 그대로 들어가면
  // 검색 결과와 공유 미리보기에서 끊기거나 공백이 겹쳐 보인다.
  seoTitle: string;
  date: string; // 화면 표시용으로 가공된 날짜 (한국 시간 기준)
  // SEO용 원본 날짜(ISO 8601). sitemap lastmod, JSON-LD, OG article 시간에 사용.
  // 표시용 date는 기계가 읽을 수 없어서 별도로 들고 있는다.
  publishedAt: string;
  updatedAt: string;
  imageUrl: string | null;
  body: string; // Tiptap 에디터에서 나온 HTML
  excerpt: string; // 카드 미리보기용 — 본문에서 태그를 뺀 짧은 요약
};

// 자주 나오는 HTML 엔티티 디코딩.
// 태그만 지우면 &nbsp; &amp; 등이 남아서 meta description에 그대로 노출된다.
function decodeEntities(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtmlToExcerpt(html: string, maxLength = 120) {
  const text = decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength
    ? `${text.slice(0, maxLength).trim()}...`
    : text;
}

// 서버(Vercel)는 UTC라서 getDate()를 쓰면 한국 시간 오전 9시 전 글이 전날로 표시된다.
// 한국 시간대를 명시해서 포맷한다. 출력 형식은 기존과 동일("2026년 9월 23일").
const koreanDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
});

function formatKoreanDate(iso: string) {
  return koreanDateFormatter.format(new Date(iso));
}

function toPost(row: {
  slug: string;
  eyebrow: string;
  title: string;
  body: string;
  image_url: string | null;
  created_at: string;
  updated_at?: string | null;
}): Post {
  return {
    slug: row.slug,
    eyebrow: row.eyebrow,
    title: row.title,
    // 줄바꿈·연속 공백을 공백 하나로 정리
    seoTitle: row.title.replace(/\s+/g, " ").trim(),
    date: formatKoreanDate(row.created_at),
    publishedAt: row.created_at,
    // 수정 시각이 있으면 사용, 없으면 작성 시각.
    // 구글은 IndexNow를 쓰지 않아서 sitemap lastmod가 정확해야 수정된 글을 다시 크롤링한다.
    updatedAt: row.updated_at ?? row.created_at,
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

    // 에러 시 빈 배열을 반환하면 그 빈 배열이 캐시에 저장되어
    // 다음 revalidateTag("posts") 전까지 모든 글이 404, sitemap도 빈 상태가 된다.
    // throw 하면 unstable_cache가 결과를 캐싱하지 않고 다음 요청에서 다시 시도한다.
    // "글이 없음"과 "글을 못 가져옴"은 다른 상황이므로 구분해야 한다.
    if (error) {
      throw new Error(`Supabase posts fetch error: ${error.message}`);
    }

    return (data ?? []).map(toPost);
  },
  ["posts"],
  {
    tags: ["posts"],
    // 안전장치: revalidateTag 호출이 누락되더라도 1시간마다 새로 가져온다.
    revalidate: 3600,
  }
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