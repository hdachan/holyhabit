"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import PlaceholderExtension from "@tiptap/extension-placeholder";
import { uploadImage } from "@/app/actions";

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
}: {
  initialContent?: string;
  onChange: (html: string) => void;
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
      LinkExtension.configure({ openOnClick: false }),
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
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했어요.");
    } finally {
      setUploading(false);
    }
  }

  if (!editor) return null;

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
          onClick={() => {
            const url = window.prompt("링크 URL을 입력하세요");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
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

      <EditorContent editor={editor} />

      {error && (
        <p className="border-t border-black/10 bg-red-50 px-4 py-2 text-[13px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}