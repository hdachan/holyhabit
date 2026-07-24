"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createPost, uploadImage } from "@/app/actions";
import RichTextEditor from "@/components/RichTextEditor";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
// 영문 소문자, 숫자, 하이픈(-)만 허용 — 서버(app/actions.ts)와 동일한 규칙
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function suggestSlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // 한글 등은 자동 제안에서 제외 (직접 입력해야 함)
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export default function AdminPage() {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [eyebrow, setEyebrow] = useState("업데이트");
  const [bodyHtml, setBodyHtml] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  const [coverUploading, setCoverUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    // slug를 아직 직접 건드리지 않았다면, 제목에서 자동으로 제안해줍니다
    // (한글 제목이면 제안이 비어있을 수 있어요 — 그럴 땐 직접 입력해야 해요)
    if (!slugTouched) {
      setSlug(suggestSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value.toLowerCase());
  }

  async function handleCoverPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("대표이미지 용량은 5MB를 넘을 수 없어요.");
      return;
    }

    setError(null);
    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadImage(formData);
      setCoverImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했어요.");
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!bodyHtml.trim() || bodyHtml === "<p></p>") {
      setError("본문을 입력해주세요.");
      return;
    }
    if (!slug.trim()) {
      setError("주소(slug)를 입력해주세요.");
      return;
    }
    if (!SLUG_PATTERN.test(slug)) {
      setError(
        "주소(slug)에는 한글을 사용할 수 없어요. 영문 소문자, 숫자, -만 입력해주세요. (예: my-first-post)"
      );
      return;
    }

    setSubmitting(true);
    try {
      await createPost({ title, slug, eyebrow, bodyHtml, imageUrl: coverImageUrl });
      setDone(true);
      setTimeout(() => router.push("/"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto max-w-[720px] px-6 py-16">
        <h1 className="mb-2 text-[28px] font-bold text-[#1d1d1f]">
          새 글 작성
        </h1>
        <p className="mb-8 text-[14px] text-[#6e6e73]">
          ⚠️ 아직 로그인 보호가 없는 임시 페이지예요. 이 주소는 외부에
          공유하지 마세요.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#6e6e73]">
              라벨 (예: 업데이트, 보도자료)
            </label>
            <input
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-[#1d1d1f]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#6e6e73]">
              제목
            </label>
            <textarea
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              rows={2}
              className="w-full resize-y rounded-lg border border-black/10 bg-white px-4 py-2 text-[#1d1d1f]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#6e6e73]">
              주소 (slug) — 한글 불가, 영문 소문자·숫자·- 만 가능
            </label>
            <input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="my-first-post"
              required
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 font-mono text-[14px] text-[#1d1d1f]"
            />
            <p className="mt-1 text-[12px] text-[#8e8e93]">
              /news/{slug || "..."}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#6e6e73]">
              대표이미지 (5MB 이하)
            </label>
            <div className="flex items-center gap-4">
              {coverImageUrl ? (
                <div className="relative h-20 w-32 overflow-hidden rounded-lg border border-black/10">
                  <Image
                    src={coverImageUrl}
                    alt="대표이미지 미리보기"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-dashed border-black/20 text-[12px] text-[#8e8e93]">
                  미리보기
                </div>
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="rounded-lg border border-black/10 bg-white px-4 py-2 text-[14px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]"
              >
                {coverUploading
                  ? "업로드 중..."
                  : coverImageUrl
                  ? "다시 선택"
                  : "이미지 선택"}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverPick}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#6e6e73]">
              본문 (이미지는 툴바의 🖼️ 버튼으로 삽입, 5MB 이하)
            </label>
            <RichTextEditor onChange={setBodyHtml} />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-[14px] text-red-600">
              {error}
            </p>
          )}
          {done && (
            <p className="rounded-lg bg-green-50 px-4 py-2 text-[14px] text-green-700">
              게시 완료! 홈으로 이동할게요...
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-[#1d1d1f] px-8 py-3 text-[15px] font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "게시 중..." : "게시하기"}
          </button>
        </form>
      </div>
    </div>
  );
}