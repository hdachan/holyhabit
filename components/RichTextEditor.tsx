"use client";

import { useRef, useState } from "react";
import {
  useEditor,
  useEditorState,
  EditorContent,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import PlaceholderExtension from "@tiptap/extension-placeholder";
import { uploadImage } from "@/app/actions";
import { checkAlt } from "@/lib/alt";
import type { PostOption } from "@/lib/related";
import LinkDialog from "@/components/LinkDialog";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function ToolbarButton({
  onClick,
  active,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`rounded-md px-3 py-1.5 text-[14px] font-medium transition ${
        active
          ? "bg-[#1d1d1f] text-white"
          : "text-[#1d1d1f] hover:bg-[#eceef0]"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  initialContent = "",
  onChange,
  postOptions = [],
}: {
  initialContent?: string;
  onChange: (html: string) => void;
  // 🔗 "내 글 고르기"에서 고를 수 있는 글 목록
  postOptions?: PostOption[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ImageExtension.configure({
        HTMLAttributes: { class: "rounded-xl" },
      }),
      // 기본값은 모든 링크에 target="_blank" rel="nofollow ..."를 붙인다.
      // 내 글 링크에 nofollow가 붙으면 검색엔진이 따라가지 않으므로 여기서는 빼고,
      // 저장할 때(lib/sanitize.ts) 외부 링크에만 새 탭 열기를 붙인다.
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { target: null, rel: null },
      }),
      PlaceholderExtension.configure({
        placeholder: "본문을 입력하세요...",
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "post-body min-h-[300px] px-4 py-3 text-[16px] leading-[1.7] text-[#1d1d1f] focus:outline-none",
      },
    },
  });

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 다시 선택해도 onChange가 다시 뜨도록
    if (!file || !editor) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("이미지 용량은 5MB를 넘을 수 없어요.");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadImage(formData);
      // 사진 설명(alt): 검색엔진은 사진을 볼 수 없어서 이 글로 사진 내용을 이해한다.
      // 나중에 사진을 클릭해서 고칠 수도 있다.
      const alt =
        window.prompt(
          "사진 설명을 입력하세요 (예: 헬스장 벤치 위에 놓인 수건)\n검색엔진이 사진 내용을 이해하는 데 쓰여요."
        ) ?? "";
      editor.chain().focus().setImage({ src: url, alt: alt.trim() }).run();
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했어요.");
    } finally {
      setUploading(false);
    }
  }

  if (!editor) return null;

  return (
    <EditorBody
      editor={editor}
      fileInputRef={fileInputRef}
      uploading={uploading}
      error={error}
      onImagePick={handleImagePick}
      postOptions={postOptions}
    />
  );
}

// 사진을 선택(클릭)했을 때 설명(alt)을 보여주고 고칠 수 있는 칸.
// 선택 상태가 바뀔 때마다 다시 그려야 해서 useEditorState로 구독한다.
function ImageAltField({ editor }: { editor: Editor }) {
  const image = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor.isActive("image")
        ? { alt: (editor.getAttributes("image").alt as string | undefined) ?? "" }
        : null,
  });
  const [showGuide, setShowGuide] = useState(false);
  if (!image) return null;

  const check = checkAlt(image.alt);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-black/10 bg-[#fffbe6] px-3 py-2">
      <label className="shrink-0 text-[13px] font-medium text-[#1d1d1f]">
        사진 설명
      </label>
      <input
        value={image.alt}
        onChange={(e) =>
          editor.chain().updateAttributes("image", { alt: e.target.value }).run()
        }
        placeholder="예: 헬스장 벤치 위에 놓인 수건과 물병"
        className="min-w-0 flex-1 rounded-md border border-black/10 bg-white px-3 py-1.5 text-[14px]"
      />
      <button
        type="button"
        onClick={() => setShowGuide((v) => !v)}
        className="shrink-0 text-[12px] font-medium text-[#6e6e73] underline hover:text-[#1d1d1f]"
      >
        {showGuide ? "작성법 닫기" : "작성법"}
      </button>
      <p className={`w-full text-[12px] ${check.ok ? "text-green-700" : "text-amber-700"}`}>
        {check.ok ? "✅" : "⚠️"} {check.message}
      </p>
      {showGuide && (
        <div className="w-full rounded-md bg-white p-3 text-[12px] leading-[1.6] text-[#1d1d1f]">
          <p>검색엔진은 사진을 볼 수 없어서 이 설명으로 사진 내용을 이해해요. 한국어로 쓰면 돼요.</p>
          <ul className="mt-2 list-disc pl-4">
            <li>사진에 <b>보이는 것</b>을 구체적으로: 무엇이, 어디서, 어떤 모습인지</li>
            <li>한 문장, 100자 이내</li>
            <li>&quot;사진&quot;, &quot;이미지&quot;라는 말은 빼기 (화면 낭독기가 이미 알려줘요)</li>
            <li>키워드는 사진 내용과 맞을 때만 자연스럽게. 억지로 넣으면 스팸으로 보여요</li>
          </ul>
          <p className="mt-2 text-red-700">❌ 사진1 · IMG_2024.png · 헬스장 매너 헬스장 매너 헬스장</p>
          <p className="mt-1 text-green-700">✅ 운동 후 덤벨을 제자리에 정리하는 모습</p>
          <p className="mt-1 text-green-700">✅ 러닝 앱에 기록된 5km 달리기 결과 화면</p>
        </div>
      )}
    </div>
  );
}

function EditorBody({
  editor,
  fileInputRef,
  uploading,
  error,
  onImagePick,
  postOptions,
}: {
  editor: Editor;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
  error: string | null;
  onImagePick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  postOptions: PostOption[];
}) {
  const handleImagePick = onImagePick;
  const [linkOpen, setLinkOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-1 border-b border-black/10 bg-[#f5f5f7] p-2">
        <ToolbarButton
          label="굵게"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          label="기울임"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          label="제목 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="제목 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          label="글머리 기호 목록"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </ToolbarButton>
        <ToolbarButton
          label="번호 목록"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          label="인용구"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          &ldquo;
        </ToolbarButton>
        <ToolbarButton
          label="링크"
          active={editor.isActive("link")}
          onClick={() => setLinkOpen(true)}
        >
          🔗
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-black/10" />

        <ToolbarButton
          label="이미지 삽입"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "업로드 중..." : "🖼️ 이미지"}
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImagePick}
        />
      </div>

      <ImageAltField editor={editor} />

      {linkOpen && (
        <LinkDialog
          editor={editor}
          postOptions={postOptions}
          onClose={() => setLinkOpen(false)}
        />
      )}

      <EditorContent editor={editor} />

      {error && (
        <p className="border-t border-black/10 bg-red-50 px-4 py-2 text-[13px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}