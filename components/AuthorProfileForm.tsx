"use client";

import { useState } from "react";
import Image from "next/image";
import { saveAuthorProfile } from "@/app/actions";
import {
  AUTHOR_BIO_MAX,
  AUTHOR_NAME_MAX,
  checkAuthorInput,
  type Author,
} from "@/lib/authors";

export default function AuthorProfileForm({ initial }: { initial: Author | null }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const problem = checkAuthorInput({ name, bio });
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await saveAuthorProfile({ name, bio });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto max-w-[720px] px-4 py-10 sm:px-6 sm:py-16">
        <h1 className="text-[24px] font-bold text-[#1d1d1f] sm:text-[28px]">내 작성자 정보</h1>
        <p className="mt-2 text-[14px] leading-[1.6] text-[#6e6e73]">
          이 계정으로 쓴 글에 작성자로 표시돼요. 여기서 바꾸면 이미 쓴 글에도 바로 반영돼요.
          <br />
          검색엔진은 누가 썼는지 분명한 글을 더 믿을 만하다고 봐요.
        </p>

        {!initial && (
          <p className="mt-4 rounded-lg bg-[#fffbe6] px-4 py-3 text-[14px] text-amber-800">
            ⚠️ 작성자 이름을 입력해야 새 글을 올릴 수 있어요.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#6e6e73]">
              글에 표시할 이름은 무엇인가요?
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={AUTHOR_NAME_MAX}
              placeholder="예: 피오니"
              className="w-full min-w-0 rounded-lg border border-black/10 bg-white px-4 py-2 text-[#1d1d1f]"
            />
            <p className="mt-1 text-[12px] text-[#8e8e93]">
              실명이 아니어도 돼요. 대신 한번 정하면 계속 같은 이름을 쓰는 게 좋아요.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#6e6e73]">
              나는 어떤 사람인가요? (한두 문장)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={AUTHOR_BIO_MAX}
              rows={3}
              placeholder="예: 3년째 매일 아침 운동 기록을 남기는 습관 덕후. 혼자서는 작심삼일이던 습관을 함께해서 이어온 이야기를 씁니다."
              className="w-full min-w-0 resize-y rounded-lg border border-black/10 bg-white px-4 py-2 text-[#1d1d1f]"
            />
            <p className="mt-1 flex justify-between gap-4 text-[12px] text-[#8e8e93]">
              <span>내 경험이나 관심사를 쓰면 글의 신뢰도가 올라가요.</span>
              <span className="shrink-0">
                {bio.trim().length}/{AUTHOR_BIO_MAX}
              </span>
            </p>
          </div>

          {/* 글 페이지 맨 아래에 보이는 모습 미리보기 */}
          <div>
            <p className="mb-2 text-sm font-medium text-[#6e6e73]">글 아래에는 이렇게 보여요</p>
            <div className="flex items-center gap-4 rounded-xl bg-white p-5">
              <Image
                src="/icon.png"
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 rounded-full"
              />
              <div className="min-w-0">
                <p className="text-[16px] font-bold text-[#1d1d1f]">
                  {name.trim() || "이름"}
                </p>
                {bio.trim() && (
                  <p className="mt-0.5 text-[14px] text-[#6e6e73]">{bio.trim()}</p>
                )}
              </div>
            </div>
          </div>

          {error && <p className="text-[14px] text-red-600">{error}</p>}
          {saved && <p className="text-[14px] text-green-700">✅ 저장했어요.</p>}

          <button
            type="submit"
            disabled={saving}
            className="self-start rounded-full bg-[#1d1d1f] px-6 py-2.5 text-[15px] font-medium text-white disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
