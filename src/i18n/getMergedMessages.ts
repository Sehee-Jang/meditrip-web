// import { promises as fs } from "fs";
// import path from "path";

// export async function getMergedMessages(locale: string) {
//   const messagesDir = path.join(process.cwd(), "messages", locale);
//   const files = await fs.readdir(messagesDir);

//   const merged: Record<string, unknown> = {};

//   for (const file of files) {
//     if (!file.endsWith(".json")) continue;

//     const filePath = path.join(messagesDir, file);
//     const content = await fs.readFile(filePath, "utf-8");
//     const json = JSON.parse(content);

//     const namespace = file.replace(/\.json$/, "");
//     merged[namespace] = json;
//   }

//   return merged;
// }

// src/i18n/getMergedMessages.ts
// "fs" 사용 금지! Edge 호환 버전

export const NAMESPACES = [
  "amenities",
  "article",
  "button",
  "categories",
  "clinic",
  "clinic-detail",
  "coming-soon",
  "common",
  "community-page",
  "community-section",
  "shorts-section",
  "shorts-page",
  "faq-page",
  "faq-section",
  "footer",
  "header",
  "hero-section",

  "login-page",
  "my-favorite",
  "mypage",
  "package-detail",
  "privacy-page",
  "question-detail",
  "question-form",
  "question-toast",
  "questions-page",
  "settings-page",
  "signup-section",
  "terms-page",
  "tour-page",
  "recovery",
] as const;

type Namespace = (typeof NAMESPACES)[number];
type Dict = Record<string, unknown>;

export async function getMergedMessages(locale: "ko" | "ja") {
  const entries = await Promise.all(
    NAMESPACES.map(async (ns: Namespace) => {
      // request.ts가 src/i18n/ 안에 있으므로, messages는 프로젝트 루트 기준 경로에 맞춰 조정
      // messages/<locale>/<ns>.json
      const mod = await import(`../../messages/${locale}/${ns}.json`);
      return [ns, mod.default as Dict] as const;
    })
  );

  // { "<ns>": { ... } } 형태로 합쳐서 반환
  return Object.fromEntries(entries) as Record<Namespace, Dict>;
}
