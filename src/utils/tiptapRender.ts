import { generateHTML } from "@tiptap/html";
import { StarterKit } from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

// tiptap JSON의 최소 형태(로컬 정의). 서버 페이지가 @tiptap/core 타입에 의존하지 않도록.
export interface JSONContent {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: JSONContent[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
}

// 런타임 타입 가드
export function isDoc(v: unknown): v is JSONContent {
  return (
    !!v && typeof v === "object" && (v as { type?: unknown }).type === "doc"
  );
}

/** 빈 문서/공백만 있는 문서 판단 */
export function isDocEmpty(doc: unknown): boolean {
  if (!isDoc(doc)) return true;
  const c = Array.isArray(doc.content) ? doc.content : [];
  if (c.length === 0) return true;

  // 빈 문단만 있는 경우
  if (c.length === 1 && c[0]?.type === "paragraph" && !c[0].content?.length)
    return true;
  if (
    c.length === 1 &&
    c[0]?.type === "paragraph" &&
    c[0].content?.length === 1 &&
    c[0].content[0]?.type === "text" &&
    typeof c[0].content[0].text === "string" &&
    c[0].content[0].text.trim() === ""
  )
    return true;

  return false;
}

export function renderTiptapHTML(doc: unknown): string {
  if (!isDoc(doc)) return ""; // 안전망
  return generateHTML(doc, [
    StarterKit, // bullet/ordered list 포함
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Highlight.configure({ multicolor: true }),
    Image,
    TaskList,
    TaskItem,
  ]);
}
