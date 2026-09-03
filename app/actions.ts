"use server";

import { updateTag } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// 영문 소문자, 숫자, 하이픈(-)만 허용. 한글/공백/특수문자는 전부 거부합니다.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

type CreatePostInput = {
  title: string;
  slug: string;
  eyebrow: string;
  bodyHtml: string;
  imageUrl: string | null;
};

type UpdatePostInput = CreatePostInput & {
  originalSlug: string;
};

export async function createPost(input: CreatePostInput) {
  const title = input.title.trim();
  const slug = input.slug.trim();
  const eyebrow = input.eyebrow.trim() || "업데이트";
  const bodyHtml = input.bodyHtml.trim();

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

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("posts").insert({
    slug,
    eyebrow,
    title,
    body: bodyHtml,
    image_url: input.imageUrl || null,
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
  const title = input.title.trim();
  const slug = input.slug.trim();
  const eyebrow = input.eyebrow.trim() || "업데이트";
  const bodyHtml = input.bodyHtml.trim();
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
  const { error, data } = await supabase
    .from("posts")
    .update({
      slug,
      eyebrow,
      title,
      body: bodyHtml,
      image_url: input.imageUrl || null,
    })
    .eq("slug", originalSlug)
    .select("slug");

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

  updateTag("posts");
}

/**
 * 글을 삭제합니다. 연결된 대표이미지가 있으면 Storage에서도 함께 지웁니다.
 */
export async function deletePost(slug: string) {
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
  const path = extractStoragePath(url);
  if (!path) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from("post-images").remove([path]);
  if (error) {
    console.error("이미지 삭제 실패:", error.message);
  }
}