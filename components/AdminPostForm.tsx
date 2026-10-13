"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createPost, updatePost, uploadImage, deleteImageByUrl } from "@/app/actions";
import RichTextEditor from "@/components/RichTextEditor";
import SeoHelper, { SeoChecks, runSeoChecks } from "@/components/SeoHelper";
import CtaEditor from "@/components/CtaEditor";
import RelatedPostsEditor from "@/components/RelatedPostsEditor";
import { requiredRelatedCount, type PostOption } from "@/lib/related";
import type { PostCta } from "@/lib/cta";
import type { Post } from "@/lib/posts";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

type Props = {
  mode: "create" | "edit";
  initialPost?: Post;
  // CTA "다른 글 추천"에서 고를 수 있는 글 목록
  postOptions: PostOption[];
};

export default function AdminPostForm({ mode, initialPost, postOptions }: Props) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [eyebrow, setEyebrow] = useState(initialPost?.eyebrow ?? "업데이트");
  const [bodyHtml, setBodyHtml] = useState(initialPost?.body ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    initialPost?.imageUrl ?? null
  );
  const [cta, setCta] = useState<PostCta | null>(initialPost?.cta ?? null);
  // 연관 콘텐츠(필수). 지워진 글이 남아 있으면 빼고 시작한다.
  const [relatedSlugs, setRelatedSlugs] = useState<string[]>(
    (initialPost?.relatedSlugs ?? []).filter((s) => postOptions.some((o) => o.slug === s))
  );
  const requiredRelated = requiredRelatedCount(postOptions.length);

  // 검색 노출 도우미: 검색어(①)·다른 표현(②)은 검사용이라 저장하지 않는다.
  // 검사는 한 번만 돌리고, 결과를 오른쪽 패널과 각 입력 칸 아래에 나눠서 보여준다.
  const [seoKeyword, setSeoKeyword] = useState("");
  const [seoRelated, setSeoRelated] = useState("");
  const seoInput = { title, slug, bodyHtml, coverImageUrl };
  const seoChecks = runSeoChecks(seoInput, seoKeyword, seoRelated);
  const checksFor = (group: string) => seoChecks.filter((c) => c.group === group);

  const [coverUploading, setCoverUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // 주소(slug)는 직접 입력한다. 제목이 대부분 한글이라 자동으로 만들면
  // 한글이 모두 지워져 "-7" 같은 의미 없는 값이 들어갔다.
  // 입력 편의를 위해 대문자는 소문자로, 띄어쓰기는 하이픈(-)으로만 바꿔준다.
  function handleSlugChange(value: string) {
    setSlug(value.toLowerCase().replace(/\s+/g, "-"));
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
    const previousUrl = coverImageUrl;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadImage(formData);
      setCoverImageUrl(url);

      if (previousUrl) {
        deleteImageByUrl(previousUrl).catch(() => {});
      }
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

    if (relatedSlugs.length !== requiredRelated) {
      setError(`연관 콘텐츠를 ${requiredRelated}개 골라주세요. (지금 ${relatedSlugs.length}개)`);
      document.getElementById("related-posts")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        await createPost({
          title,
          slug,
          eyebrow,
          bodyHtml,
          imageUrl: coverImageUrl,
          cta,
          relatedSlugs,
        });
      } else {
        await updatePost({
          originalSlug: initialPost!.slug,
          title,
          slug,
          eyebrow,
          bodyHtml,
          imageUrl: coverImageUrl,
          cta,
          relatedSlugs,
        });
      }
      setDone(true);
      setTimeout(() => router.push(`/news/${slug}`), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* 좌우 여백을 모바일에서 줄이고, 세로 여백도 줄임 */}
      {/* 넓은 화면: 왼쪽 글쓰기 + 오른쪽 검색 노출 도우미. 모바일: 도우미가 위에 접힌 상태로 */}
      <div className="mx-auto grid max-w-[1120px] items-start gap-6 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,720px)_340px]">
        <h1 className="text-[24px] font-bold text-[#1d1d1f] sm:text-[28px] lg:col-span-2">
          {mode === "create" ? "새 글 작성" : "글 수정"}
        </h1>

        <div className="lg:order-2">
          <SeoHelper
            input={seoInput}
            checks={seoChecks}
            keyword={seoKeyword}
            onKeywordChange={setSeoKeyword}
            related={seoRelated}
            onRelatedChange={setSeoRelated}
          />
        </div>

        <form onSubmit={handleSubmit} className="flex w-full min-w-0 flex-col gap-6 lg:order-1">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#6e6e73]">
              라벨 (예: 업데이트, 보도자료)
            </label>
            <input
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              className="w-full min-w-0 rounded-lg border border-black/10 bg-white px-4 py-2 text-[#1d1d1f]"
            />
          </div>

          <div id="seo-title" className="scroll-mt-6">
            <label className="mb-1 block text-sm font-medium text-[#6e6e73]">
              제목
            </label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              rows={2}
              className="w-full min-w-0 resize-y rounded-lg border border-black/10 bg-white px-4 py-2 text-[#1d1d1f]"
            />
            <SeoChecks checks={checksFor("title")} />
          </div>

          <div id="seo-slug" className="scroll-mt-6">
            <label className="mb-1 block text-sm font-medium text-[#6e6e73]">
              주소 (slug)
            </label>
            <p className="mb-1.5 text-[12px] text-[#8e8e93]">
              글 내용을 나타내는 영어 단어를 하이픈(-)으로 이어서 직접 적어요.{" "}
              <b className="font-semibold text-[#1d1d1f]">한글은 쓸 수 없어요.</b>{" "}
              영문 소문자·숫자·-만 가능하고, 띄어쓰기는 자동으로 -로 바뀌어요.
            </p>
            <input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="예: 헬스장 매너 → gym-etiquette-tips"
              required
              className="w-full min-w-0 rounded-lg border border-black/10 bg-white px-4 py-2 font-mono text-[14px] text-[#1d1d1f]"
            />
            {/* 긴 slug가 화면 밖으로 삐져나가지 않게 break-all 추가 */}
            <p className="mt-1 break-all text-[12px] text-[#8e8e93]">
              /news/{slug || "..."}
            </p>
            {mode === "edit" && (
              <p className="mt-1 text-[12px] text-amber-600">
                주소를 바꾸면 기존 링크(북마크, 검색 결과 등)가 깨질 수 있어요.
              </p>
            )}
            <SeoChecks checks={checksFor("slug")} />
          </div>

          <div id="seo-cover" className="scroll-mt-6">
            <label className="mb-1 block text-sm font-medium text-[#6e6e73]">
              대표이미지 (5MB 이하)
            </label>
            {/* flex-wrap을 추가해서, 좁은 화면에서 버튼이 아래 줄로 자연스럽게 내려가게 함 */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {coverImageUrl ? (
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-black/10">
                  <Image
                    src={coverImageUrl}
                    alt="대표이미지 미리보기"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg border border-dashed border-black/20 text-[12px] text-[#8e8e93]">
                  미리보기
                </div>
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="shrink-0 rounded-lg border border-black/10 bg-white px-4 py-2 text-[14px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]"
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
            <SeoChecks checks={checksFor("cover")} />
          </div>

          <div id="seo-body" className="scroll-mt-6">
            <label className="mb-1 block text-sm font-medium text-[#6e6e73]">
              본문 (이미지는 툴바의 🖼️ 버튼으로 삽입, 5MB 이하)
            </label>
            {/* 에디터 내부 툴바가 넘칠 경우를 대비해 가로 스크롤 허용 */}
            <div className="w-full min-w-0 overflow-x-auto">
              <RichTextEditor
                onChange={setBodyHtml}
                initialContent={initialPost?.body}
                postOptions={postOptions}
              />
            </div>
            <SeoChecks checks={checksFor("body")} />
          </div>

          <CtaEditor value={cta} onChange={setCta} />

          <RelatedPostsEditor
            value={relatedSlugs}
            onChange={setRelatedSlugs}
            options={postOptions}
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-[14px] text-red-600">
              {error}
            </p>
          )}
          {done && (
            <p className="rounded-lg bg-green-50 px-4 py-2 text-[14px] text-green-700">
              게시 완료! 이동할게요...
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-full bg-[#1d1d1f] px-8 py-3 text-[15px] font-medium text-white transition hover:opacity-90 disabled:opacity-50 sm:w-auto"
          >
            {submitting
              ? "저장 중..."
              : mode === "create"
              ? "게시하기"
              : "수정 완료"}
          </button>
        </form>
      </div>
    </div>
  );
}