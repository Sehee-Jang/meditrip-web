"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import type { JSONContent } from "@tiptap/core";

export default function RichTextViewer({ doc }: { doc: JSONContent }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      // 링크 확장: 뷰어에서 앵커를 확실히 렌더
      Link.configure({
        autolink: true,
        openOnClick: true,
        HTMLAttributes: { class: "tiptap-link" }, // 스타일용 클래스 부여
      }),
      // 정렬 확장: paragraph/heading의 text-align 유지
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
    ],
    editable: false,
    content: doc,
    immediatelyRender: false,
    onCreate: ({ editor }) => {
      // 보기 화면에서는 포커스 X
      editor?.commands.blur();
    },
  });

  if (!editor) return null;

  return (
    <div className='p-3'>
      <EditorContent editor={editor} />
    </div>
  );
}
