"use server";

import { updateTag } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { sanitizePostHtml } from "@/lib/sanitize";
import { requireAdmin } from "@/lib/auth";
import { parseCta, type PostCta } from "@/lib/cta";
import { requiredRelatedCount } from "@/lib/related";
import { checkAuthorInput, type Author } from "@/lib/authors";
import { getAuthorById } from "@/lib/authors-db";
import { isAllowedLabel, POST_LABELS } from "@/lib/labels";
import { SUMMARY_MAX } from "@/lib/summary";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// 검색 결과 한 줄 요약: 공백을 정리하고 길이를 확인한다. (화면과 같은 기준: lib/summary.ts)
function checkSummary(summary: string | undefined) {
  const value = (summary ?? "").replace(/\s+/g, " ").trim();
  if (value.length > SUMMARY_MAX) {
    throw new Error(`검색 결과 한 줄 요약은 ${SUMMARY_MAX}자 이내로 써주세요. (지금 ${value.length}자)`);
  }
  // 비어 있으면 null로 저장 → 본문 앞부분이 자동 요약으로 쓰인다
  return value || null;
}

// 영문 소문자, 숫자, 하이픈(-)만 허용. 한글/공백/특수문자는 전부 거부합니다.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// 대표 이미지는 우리 Supabase Storage에 올린 것만 허용한다.
// next.config.ts의 이미지 허용 도메인과 맞춰야 한다. 다른 주소가 저장되면
// next/image가 변환을 거부해서 글 페이지가 에러로 깨진다.
const STORAGE_PUBLIC_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;

function checkImageUrl(url: string | null) {
  if (!url) return null;
  if (!url.startsWith(STORAGE_PUBLIC_PREFIX)) {
    throw new Error("대표 이미지는 업로드한 이미지만 사용할 수 있어요.");
  }
  return url;
}

// 글 하단 CTA. 입력이 있는데 형식이 맞지 않으면 조용히 버리지 않고 알려준다.
function checkCta(cta: PostCta | null | undefined) {
  if (!cta) return null;
  const parsed = parseCta(cta);
  if (!parsed) {
    throw new Error(
      "CTA 링크 버튼의 버튼 글자와 링크(https:// 또는 /로 시작)를 확인해주세요."
    );
  }
  return parsed;
}

/**
 * 연관 콘텐츠는 필수: 다른 글 3개를 직접 골라야 저장된다.
 * (다른 글이 3개보다 적은 사이트 초기에는 있는 만큼)
 * 화면에서도 막지만, Server Action은 직접 호출될 수 있어서 서버에서 다시 확인한다.
 * 지금 쓰는 글 자신(새 주소·원래 주소)과 존재하지 않는 글은 고를 수 없다.
 */
async function checkRelatedSlugs(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  input: string[] | undefined,
  selfSlugs: string[]
) {
  const { data, error } = await supabase.from("posts").select("slug");
  if (error) throw new Error(error.message);

  const available = new Set(
    (data ?? []).map((p) => p.slug as string).filter((s) => !selfSlugs.includes(s))
  );
  const picked = [...new Set(input ?? [])].filter((s) => available.has(s));
  const required = requiredRelatedCount(available.size);

  if (picked.length !== required) {
    throw new Error(
      `연관 콘텐츠를 ${required}개 골라주세요. (지금 ${picked.length}개)`
    );
  }
  return picked;
}

// 글을 쓰거나 고친 사람을 기록하려면 그 계정의 작성자 정보(이름)가 있어야 한다.
async function requireAuthorProfile(userId: string) {
  if (!(await getAuthorById(userId))) {
    throw new Error("먼저 상단 메뉴의 \"내 작성자 정보\"에서 작성자 이름을 입력해주세요.");
  }
}

type CreatePostInput = {
  title: string;
  summary: string;
  slug: string;
  eyebrow: string;
  bodyHtml: string;
  imageUrl: string | null;
  cta: PostCta | null;
  relatedSlugs: string[];
};

type UpdatePostInput = CreatePostInput & {
  originalSlug: string;
};

export async function createPost(input: CreatePostInput) {
  const user = await requireAdmin();

  const title = input.title.trim();
  const slug = input.slug.trim();
  const eyebrow = input.eyebrow.trim();
  const bodyHtml = sanitizePostHtml(input.bodyHtml).trim();

  if (!title || !bodyHtml) {
    throw new Error("제목과 본문은 필수예요.");
  }
  if (!isAllowedLabel(eyebrow)) {
    throw new Error(`라벨을 골라주세요. (${POST_LABELS.join(", ")})`);
  }

  if (!slug) {
    throw new Error("주소(slug)를 입력해주세요.");
  }

  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      "주소(slug)에는 한글을 사용할 수 없어요. 영문 소문자, 숫자, -만 입력해주세요. (예: my-first-post)"
    );
  }

  await requireAuthorProfile(user.id);

  const supabase = createSupabaseAdminClient();
  const relatedSlugs = await checkRelatedSlugs(supabase, input.relatedSlugs, [slug]);
  const { error } = await supabase.from("posts").insert({
    slug,
    eyebrow,
    title,
    body: bodyHtml,
    cta: checkCta(input.cta),
    related_slugs: relatedSlugs,
    image_url: checkImageUrl(input.imageUrl),
    summary: checkSummary(input.summary),
    author_id: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "이미 사용 중인 주소(slug)예요. 다른 주소를 입력해주세요."
      );
    }
    throw new Error(error.message);
  }

  // 글을 쓴 사람이 바로 결과를 볼 수 있도록 즉시 캐시를 갱신합니다.
  // (updateTag는 Server Action 안에서만 쓸 수 있고, 다음 요청이 무조건
  // 최신 데이터를 기다렸다가 보여줍니다 — revalidateTag와 달리 지연이 없어요)
  updateTag("posts");
}

/**
 * 기존 글을 수정합니다. slug 자체를 바꿀 수도 있어서,
 * 어떤 행을 수정할지는 originalSlug로 찾습니다.
 */
export async function updatePost(input: UpdatePostInput) {
  const user = await requireAdmin();
  await requireAuthorProfile(user.id);

  const title = input.title.trim();
  const slug = input.slug.trim();
  const eyebrow = input.eyebrow.trim();
  const bodyHtml = sanitizePostHtml(input.bodyHtml).trim();
  const originalSlug = input.originalSlug.trim();

  if (!title || !bodyHtml) {
    throw new Error("제목과 본문은 필수예요.");
  }
  if (!slug) {
    throw new Error("주소(slug)를 입력해주세요.");
  }
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      "주소(slug)에는 한글을 사용할 수 없어요. 영문 소문자, 숫자, -만 입력해주세요. (예: my-first-post)"
    );
  }
  if (!originalSlug) {
    throw new Error("수정할 글을 찾을 수 없어요.");
  }

  const supabase = createSupabaseAdminClient();

  // 라벨: 목록 중 하나. 예전 글의 라벨(예: "업데이트")은 바꾸지 않았다면 그대로 허용한다.
  const { data: before } = await supabase
    .from("posts")
    .select("eyebrow")
    .eq("slug", originalSlug)
    .maybeSingle();
  if (!isAllowedLabel(eyebrow, before?.eyebrow)) {
    throw new Error(`라벨을 골라주세요. (${POST_LABELS.join(", ")})`);
  }

  const relatedSlugs = await checkRelatedSlugs(supabase, input.relatedSlugs, [
    slug,
    originalSlug,
  ]);
  const { error, data } = await supabase
    .from("posts")
    .update({
      slug,
      eyebrow,
      title,
      body: bodyHtml,
      cta: checkCta(input.cta),
      related_slugs: relatedSlugs,
      image_url: checkImageUrl(input.imageUrl),
      summary: checkSummary(input.summary),
      // 수정 시각. sitemap lastmod·JSON-LD dateModified로 나가서
      // 검색엔진이 "이 글이 바뀌었다"를 알고 다시 수집하게 한다.
      updated_at: new Date().toISOString(),
    })
    .eq("slug", originalSlug)
    .select("id");

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "이미 사용 중인 주소(slug)예요. 다른 주소를 입력해주세요."
      );
    }
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("수정할 글을 찾을 수 없어요. (이미 삭제되었을 수 있어요)");
  }

  // 수정 기록: 누가 언제 고쳤는지 매번 한 줄씩 남긴다. (관리자 글 목록에 표시)
  // 글 수정은 이미 끝났으므로 기록에 실패해도 수정을 되돌리지 않고 로그만 남긴다.
  const { error: editLogError } = await supabase
    .from("post_edits")
    .insert({ post_id: data[0].id, author_id: user.id });
  if (editLogError) {
    console.error("수정 기록 저장 실패:", editLogError.message);
  }

  updateTag("posts");
}

/**
 * 글을 삭제합니다. 연결된 대표이미지가 있으면 Storage에서도 함께 지웁니다.
 */
export async function deletePost(slug: string) {
  await requireAdmin();

  const supabase = createSupabaseAdminClient();

  // 삭제 전에 이미지 URL을 먼저 확보해둡니다.
  const { data: existing } = await supabase
    .from("posts")
    .select("image_url")
    .eq("slug", slug.trim())
    .maybeSingle();

  const { error } = await supabase.from("posts").delete().eq("slug", slug.trim());
  if (error) {
    throw new Error(error.message);
  }

  if (existing?.image_url) {
    await deleteImageByUrl(existing.image_url);
  }

  updateTag("posts");
}

/**
 * 이미지 업로드 (대표이미지 / 본문 삽입 이미지 공용).
 * 5MB 제한을 서버에서도 한 번 더 검증합니다 (클라이언트 검증은 우회될 수 있어서).
 */
export async function uploadImage(formData: FormData): Promise<string> {
  await requireAdmin();

  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("파일이 없어요.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("파일 용량은 5MB를 넘을 수 없어요.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있어요.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createSupabaseAdminClient();
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, Buffer.from(arrayBuffer), {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * post-images 버킷의 public URL에서 내부 저장 경로를 뽑아냅니다.
 * 형태가 다른 URL(외부 링크 등)이 들어오면 null을 반환해 삭제를 건너뜁니다.
 */
function extractStoragePath(url: string | null): string | null {
  if (!url) return null;
  const marker = "/post-images/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

/**
 * 더 이상 쓰이지 않게 된 이미지를 Storage에서 지웁니다.
 * 실패해도 전체 흐름을 막을 정도는 아니라서 에러는 로그만 남깁니다.
 */
export async function deleteImageByUrl(url: string | null) {
  await requireAdmin();

  const path = extractStoragePath(url);
  if (!path) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from("post-images").remove([path]);
  if (error) {
    console.error("이미지 삭제 실패:", error.message);
  }
}
/**
 * 로그인한 관리자의 작성자 정보(이름·소개)를 저장한다.
 * 이 계정으로 쓴 모든 글의 작성자 표시가 함께 바뀐다.
 */
export async function saveAuthorProfile(input: Author) {
  const user = await requireAdmin();

  const problem = checkAuthorInput(input);
  if (problem) throw new Error(problem);

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("authors").upsert({
    id: user.id,
    name: input.name.trim(),
    bio: input.bio.trim(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  // 글 목록 캐시에 작성자 이름이 함께 들어 있어서 같이 갱신한다.
  updateTag("posts");
}

/** 문의함: 처리 상태 바꾸기 (new = 새 문의, done = 답변 완료) */
export async function setInquiryStatus(id: number, status: "new" | "done") {
  await requireAdmin();
  if (status !== "new" && status !== "done") throw new Error("잘못된 상태예요.");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * 문의함: 문의 삭제.
 * 개인정보처리방침에 "처리 완료 후 지체 없이 파기"라고 안내하므로, 답변을 마친 문의는 지운다.
 */
export async function deleteInquiry(id: number) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
