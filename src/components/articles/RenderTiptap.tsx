import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import type { JSONContent } from "@tiptap/core";
import DOMPurify from "isomorphic-dompurify";

export default function RenderTiptap({ doc }: { doc: JSONContent }) {
  const html = generateHTML(doc, [StarterKit, Link, Image]);
  const safe = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  return <article dangerouslySetInnerHTML={{ __html: safe }} />;
}
