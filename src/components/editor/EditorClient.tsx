"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import type { JSONContent } from "@tiptap/core";

type Props = {
  /** 외부 상태(RHF 등)에서 내려오는 값 */
  value: JSONContent;
  /** 변경 시 상위로 JSON과 평문 텍스트 전달 */
  onChange: (doc: JSONContent, plainText: string) => void;
  placeholder?: string;
  className?: string;
};

/** Tiptap 래퍼: RHF/상위 상태와 양방향 바인딩 */
export default function EditorClient({
  value,
  onChange,
  placeholder = "여기에 내용을 입력하세요…",
  className,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    autofocus: "end",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getText());
    },
  });

  // 외부 value가 바뀌면 에디터 반영(불필요한 setContent 방지)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getJSON();
    const next = JSON.stringify(value);
    const prev = JSON.stringify(current);
    if (next !== prev) editor.commands.setContent(value);
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={className}>
      {/* 최소 툴바 */}
      <div className='mb-2 flex flex-wrap gap-2'>
        <button
          type='button'
          className='rounded border px-3 py-1'
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          굵게
        </button>
        <button
          type='button'
          className='rounded border px-3 py-1'
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          기울임
        </button>
        <button
          type='button'
          className='rounded border px-3 py-1'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>
        <button
          type='button'
          className='rounded border px-3 py-1'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          목록
        </button>
        <button
          type='button'
          className='rounded border px-3 py-1'
          onClick={() => {
            const url = window.prompt("이미지 URL 입력") ?? "";
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          이미지
        </button>
      </div>

      <div className='rounded-xl border p-3'>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
