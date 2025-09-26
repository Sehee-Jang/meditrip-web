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

/** text 노드가 실질적으로 비었는지(공백만 포함) */
function isTextEmpty(node: { type?: string; text?: unknown }): boolean {
  if (node.type !== "text") return false;
  const t = typeof node.text === "string" ? node.text : "";
  return t.trim().length === 0;
}

/** 내용이 있다고 간주할 미디어/임베드 노드 타입들 */
function isSemanticMedia(node: { type?: string }): boolean {
  // 에디터에서 사용하는 노드 타입에 맞춰 필요 시 추가
  return (
    node.type === "image" ||
    node.type === "figure" ||
    node.type === "media" ||
    node.type === "iframe" ||
    node.type === "embed"
  );
}

/** 무시 가능한 노드들(개행만 등) */
function isIgnorableNode(node: { type?: string }): boolean {
  return node.type === "hardBreak";
}

/** 노드가 실질적으로 비었는지 재귀 판단 */
function isNodeEmpty(node: unknown): boolean {
  if (!node || typeof node !== "object") return true;

  const n = node as { type?: string; content?: unknown[]; text?: unknown };

  // 미디어가 하나라도 있으면 내용 있음
  if (isSemanticMedia(n)) return false;

  // 하드브레이크만 있는 경우는 내용 없음
  if (isIgnorableNode(n)) return true;

  // 텍스트 노드
  if (n.type === "text") return isTextEmpty(n);

  // 블록 노드(문단/헤딩/리스트 등)
  const children = Array.isArray(n.content) ? n.content : [];
  if (children.length === 0) return true;

  // 모든 자식이 빈 경우에만 빈 노드
  return children.every((c) => isNodeEmpty(c));
}

/** 빈 문서/공백만 있는 문서 판단(강화 버전) */
export function isDocEmpty(doc: unknown): boolean {
  if (!isDoc(doc)) return true;

  const children = Array.isArray(doc.content) ? doc.content : [];
  if (children.length === 0) return true;

  // 자식 전부가 “실질적으로 빈” 노드면 빈 문서로 간주
  return children.every((n) => isNodeEmpty(n));
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
