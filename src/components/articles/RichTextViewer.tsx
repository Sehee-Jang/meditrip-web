"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import type { JSONContent } from "@tiptap/core";

export default function RichTextViewer({ doc }: { doc: JSONContent }) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
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
    <div className=' p-3'>
      <EditorContent editor={editor} />
    </div>
  );
}
