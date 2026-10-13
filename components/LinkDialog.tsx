"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { normalizeLinkInput } from "@/lib/link";
import type { PostOption } from "@/lib/related";
import PostPicker from "@/components/PostPicker";

// 에디터 🔗 버튼을 누르면 뜨는 링크 창.
// "링크 입력"(외부 사이트·주소 직접 입력)과 "내 글 고르기"(목록에서 선택) 두 가지 방법을 준다.
// 글자를 선택하지 않고 링크를 넣으면 글 제목(또는 주소)을 링크 글자로 넣어준다.
export default function LinkDialog({
  editor,
  postOptions,
  onClose,
}: {
  editor: Editor;
  postOptions: PostOption[];
  onClose: () => void;
}) {
  const currentHref = (editor.getAttributes("link").href as string | undefined) ?? "";
  const [tab, setTab] = useState<"url" | "post">(
    currentHref.startsWith("/news/") || !currentHref ? "post" : "url"
  );
  const [url, setUrl] = useState(currentHref);
  const [error, setError] = useState<string | null>(null);

  function apply(href: string, fallbackText: string) {
    const chain = editor.chain().focus().extendMarkRange("link");
    if (editor.state.selection.empty && !editor.isActive("link")) {
      // 선택한 글자가 없으면 링크 글자를 새로 넣는다.
      chain
        .insertContent({ type: "text", text: fallbackText, marks: [{ type: "link", attrs: { href } }] })
        .run();
    } else {
      chain.setLink({ href }).run();
    }
    onClose();
  }

  function applyUrl() {
    const result = normalizeLinkInput(url);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    apply(result.href, url.trim());
  }

  function removeLink() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-label="링크 넣기"
        className="w-full max-w-[460px] rounded-[16px] bg-white p-5 shadow-xl"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[16px] font-bold text-[#1d1d1f]">링크 넣기</p>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-[#8e8e93] hover:text-[#1d1d1f]">
            ✕
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-full bg-[#f5f5f7] p-1">
          {(
            [
              ["post", "내 글 고르기"],
              ["url", "링크 입력"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex-1 rounded-full py-1.5 text-[14px] font-medium ${
                tab === key ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#6e6e73]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "post" ? (
          <div>
            <p className="mb-2 text-[12px] text-[#8e8e93]">
              내 블로그의 다른 글로 연결해요. 누르면 바로 링크가 걸려요.
            </p>
            <PostPicker
              options={postOptions}
              isSelected={(slug) => currentHref === `/news/${slug}`}
              onPick={(option) => apply(`/news/${option.slug}`, option.title)}
              maxHeight={280}
            />
          </div>
        ) : (
          <div>
            <p className="mb-2 text-[12px] text-[#8e8e93]">
              외부 사이트 주소(https://...)를 넣어요. 내 글 주소(column-002 등)를 넣어도 알아서 맞춰줘요.
            </p>
            <input
              autoFocus
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyUrl();
                }
              }}
              placeholder="https://..."
              className="w-full rounded-lg border border-black/10 px-3 py-2 font-mono text-[14px] text-[#1d1d1f]"
            />
            {error && <p className="mt-2 whitespace-pre-line text-[13px] text-red-600">{error}</p>}
            <button
              type="button"
              onClick={applyUrl}
              className="mt-3 w-full rounded-full bg-[#1d1d1f] py-2.5 text-[14px] font-medium text-white hover:opacity-90"
            >
              링크 걸기
            </button>
          </div>
        )}

        {currentHref && (
          <button
            type="button"
            onClick={removeLink}
            className="mt-4 text-[13px] text-red-600 hover:underline"
          >
            링크 지우기
          </button>
        )}
      </div>
    </div>
  );
}
