import type { JSONContent } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { generateHTML } from "@tiptap/html";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

export function isDoc(v: unknown): v is JSONContent {
  return (
    !!v && typeof v === "object" && (v as { type?: unknown }).type === "doc"
  );
}

/** 빈 문서/공백만 있는 문서 판단 */
export function isDocEmpty(doc: JSONContent | null | undefined): boolean {
  if (!doc || doc.type !== "doc") return true;
  const content = Array.isArray(doc.content) ? doc.content : [];
  if (content.length === 0) return true;
  // 단일 빈 문단만 있는 경우
  if (
    content.length === 1 &&
    content[0]?.type === "paragraph" &&
    (!content[0].content || content[0].content.length === 0)
  ) {
    return true;
  }
  // 단일 문단에 공백만 있는 경우
  if (
    content.length === 1 &&
    content[0]?.type === "paragraph" &&
    Array.isArray(content[0].content) &&
    content[0].content.length === 1 &&
    content[0].content[0]?.type === "text" &&
    typeof content[0].content[0].text === "string" &&
    content[0].content[0].text.trim() === ""
  ) {
    return true;
  }
  return false;
}

/** 에디터 확장과 동일한 세트로 HTML 생성 (서버에서 사용 가능) */
export function renderTiptapHTML(doc: JSONContent): string {
  return generateHTML(doc, [
    StarterKit,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Highlight.configure({ multicolor: true }),
    Image,
    TaskList,
    TaskItem,
  ]);
}
