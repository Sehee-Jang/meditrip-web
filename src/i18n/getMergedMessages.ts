// src/i18n/getMergedMessages.ts
import { promises as fs } from "fs";
import path from "path";

export async function getMergedMessages(locale: string) {
  const messagesDir = path.join(process.cwd(), "messages", locale);
  const files = await fs.readdir(messagesDir);

  const merged: Record<string, unknown> = {};

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const filePath = path.join(messagesDir, file);
    const content = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(content);

    const namespace = file.replace(/\.json$/, "");
    merged[namespace] = json;
  }

  return merged;
}
