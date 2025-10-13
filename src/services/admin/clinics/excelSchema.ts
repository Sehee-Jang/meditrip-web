import { LOCALES_TUPLE } from "@/constants/locales";
import type {
  LocalizedRichTextDoc,
  LocalizedStringArray,
  LocalizedTextDoc,
} from "@/types/common";
import type { JSONContent } from "@/types/tiptap";

export type ExcelRowValue = string | number | boolean | null;

export const CLINIC_COLUMNS: readonly string[] = [
  "id",
  "status",
  "displayOrder",
  "isExclusive",
  "rating",
  "reviewCount",
  "phone",
  "website",
  "categoryKeys",
  "tagSlugs",
  "amenities",
  "weeklyClosedDays",
  "images",
  "socialsJson",
  "geo_lat",
  "geo_lng",
  "weeklyHoursJson",
  "doctorsJson",
  ...LOCALES_TUPLE.map((locale) => `name_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `address_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `introTitle_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `introSubtitle_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `hoursNote_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `events_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `reservationNotices_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `description_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `highlights_${locale}`),
];

const CLINIC_EXPORT_EXCLUDED_COLUMNS = new Set<string>(["images"]);
export const CLINIC_COLUMNS_EXPORT: readonly string[] = CLINIC_COLUMNS.filter(
  (column) => !CLINIC_EXPORT_EXCLUDED_COLUMNS.has(column)
);

export const HIDDEN_CLINIC_COLUMNS = new Set<string>([
  "id",
  "displayOrder",
  "rating",
  "reviewCount",
]);

export const PACKAGE_COLUMNS: readonly string[] = [
  "clinicId",
  "clinicName_ko",
  "packageId",
  ...LOCALES_TUPLE.map((locale) => `title_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `subtitle_${locale}`),
  "price_ko",
  "price_ja",
  "duration_minutes",
  "packageImages",
  "treatmentProcessJson",
  "treatmentDetailsJson",
  ...LOCALES_TUPLE.map((locale) => `precautions_${locale}`),
];

const PACKAGE_EXPORT_EXCLUDED_COLUMNS = new Set<string>([
  "clinicId",
  "packageId",
  "packageImages",
]);
export const PACKAGE_COLUMNS_EXPORT: readonly string[] = PACKAGE_COLUMNS.filter(
  (column) => !PACKAGE_EXPORT_EXCLUDED_COLUMNS.has(column)
);

export function localizedToRow(
  value: Partial<LocalizedTextDoc> | undefined,
  prefix: string,
  target: Record<string, ExcelRowValue>
) {
  for (const locale of LOCALES_TUPLE) {
    const key = `${prefix}_${locale}`;
    target[key] = value?.[locale] ?? "";
  }
}

export function localizedRichToRow(
  value: Partial<LocalizedRichTextDoc> | undefined,
  prefix: string,
  target: Record<string, ExcelRowValue>
) {
  for (const locale of LOCALES_TUPLE) {
    const key = `${prefix}_${locale}`;
    target[key] = formatRichText(value?.[locale]);
  }
}

export function localizedStringArrayToRow(
  value: Partial<LocalizedStringArray> | undefined,
  prefix: string,
  target: Record<string, ExcelRowValue>
) {
  for (const locale of LOCALES_TUPLE) {
    const key = `${prefix}_${locale}`;
    const items = value?.[locale];
    target[key] = Array.isArray(items) ? items.join("\n") : "";
  }
}

function formatHumanReadable(value: unknown, indent = 0): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "";
    }

    const allPrimitive = value.every((item) => {
      return (
        item === null ||
        item === undefined ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean"
      );
    });

    if (allPrimitive) {
      return value
        .map((item) =>
          item === null || item === undefined ? "" : String(item)
        )
        .join("\n");
    }

    const indentStr = "  ".repeat(indent);
    const nestedIndent = "  ".repeat(indent + 1);

    return value
      .map((item) => {
        const formatted = formatHumanReadable(item, indent + 1);
        if (!formatted) {
          return `${indentStr}-`;
        }

        if (formatted.includes("\n")) {
          const indented = formatted
            .split("\n")
            .map((line) => (line.length ? `${nestedIndent}${line}` : line))
            .join("\n");
          return `${indentStr}-\n${indented}`;
        }

        return `${indentStr}- ${formatted}`;
      })
      .join("\n");
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return "";
    }

    const indentStr = "  ".repeat(indent);
    const nestedIndent = "  ".repeat(indent + 1);

    return entries
      .map(([key, val]) => {
        const formatted = formatHumanReadable(val, indent + 1);
        const keyLabel = `${indentStr}${key}:`;

        if (!formatted) {
          return keyLabel;
        }

        if (formatted.includes("\n")) {
          const indented = formatted
            .split("\n")
            .map((line) => (line.length ? `${nestedIndent}${line}` : line))
            .join("\n");
          return `${keyLabel}\n${indented}`;
        }

        return `${keyLabel} ${formatted}`;
      })
      .join("\n");
  }

  return String(value);
}

export function formatArray(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) {
    return "";
  }

  return formatHumanReadable(value);
}

export function formatJson(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return formatHumanReadable(value);
}
function isTiptapDoc(value: unknown): value is JSONContent {
  return (
    !!value &&
    typeof value === "object" &&
    (value as { type?: unknown }).type === "doc"
  );
}

function toJsonNode(value: unknown): JSONContent | null {
  if (
    value &&
    typeof value === "object" &&
    typeof (value as { type?: unknown }).type === "string"
  ) {
    return value as JSONContent;
  }

  return null;
}

function normalizeMultilineText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n")
    .trim();
}

function collectInlineText(nodes: JSONContent[] | undefined): string {
  if (!Array.isArray(nodes)) {
    return "";
  }

  return nodes
    .map((child) => {
      const node = toJsonNode(child);
      if (!node) {
        return "";
      }

      if (node.type === "text") {
        const raw = typeof node.text === "string" ? node.text : "";
        const linkMark = Array.isArray(node.marks)
          ? node.marks.find((mark) => mark?.type === "link")
          : undefined;
        const href = linkMark?.attrs?.href;

        if (typeof href === "string" && href.length > 0 && href !== raw) {
          return `${raw} (${href})`;
        }

        return raw;
      }

      if (node.type === "hardBreak") {
        return "\n";
      }

      if (node.type === "image") {
        const alt = node.attrs?.alt;
        const src = node.attrs?.src;
        if (typeof alt === "string" && typeof src === "string") {
          return `[${alt}] (${src})`;
        }
        if (typeof src === "string") {
          return `[Image] (${src})`;
        }
        if (typeof alt === "string") {
          return `[${alt}]`;
        }
        return "[Image]";
      }

      if (Array.isArray(node.content)) {
        return collectInlineText(node.content);
      }

      if (typeof node.text === "string") {
        return node.text;
      }

      return "";
    })
    .join("");
}

function addMultilineText(
  target: string[],
  indent: number,
  text: string
): void {
  const normalized = normalizeMultilineText(text);
  if (!normalized) {
    return;
  }

  const baseIndent = indent > 0 ? " ".repeat(indent) : "";
  const lines = normalized.split("\n");
  for (const line of lines) {
    target.push(`${baseIndent}${line}`);
  }
}

function emitBulletText(
  target: string[],
  indent: number,
  prefix: string,
  text: string
): void {
  const normalized = normalizeMultilineText(text);
  const baseIndent = indent > 0 ? " ".repeat(indent) : "";

  if (!normalized) {
    target.push(`${baseIndent}${prefix}`.trimEnd());
    return;
  }

  const lines = normalized.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (index === 0) {
      target.push(`${baseIndent}${prefix}${line}`);
    } else {
      target.push(`${baseIndent}${" ".repeat(prefix.length)}${line}`);
    }
  }
}

function serializeListItem(
  item: JSONContent,
  indent: number,
  target: string[],
  options: { type: "bullet" } | { type: "ordered"; index: number }
): void {
  const node = toJsonNode(item);
  if (!node) {
    return;
  }
  if (node.type !== "listItem") {
    serializeRichNode(node, indent, target);
    return;
  }

  const prefix =
    options.type === "bullet" ? "- " : `${Math.max(options.index, 1)}. `;

  const children = Array.isArray(node.content) ? node.content : [];
  let bulletAdded = false;

  for (const child of children) {
    const childNode = toJsonNode(child);
    if (childNode?.type === "paragraph") {
      const text = collectInlineText(childNode.content);
      if (text) {
        if (!bulletAdded) {
          emitBulletText(target, indent, prefix, text);
          bulletAdded = true;
        } else {
          addMultilineText(target, indent + 2, text);
        }
      }
      continue;
    }

    if (!bulletAdded) {
      emitBulletText(target, indent, prefix, "");
      bulletAdded = true;
    }

    if (childNode) {
      serializeRichNode(childNode, indent + 2, target);
    } else {
      const fallback = formatHumanReadable(child);
      if (fallback) {
        addMultilineText(target, indent + 2, fallback);
      }
    }
  }

  if (!bulletAdded) {
    emitBulletText(target, indent, prefix, "");
  }
}

function serializeRichNode(
  node: JSONContent,
  indent: number,
  target: string[]
): void {
  switch (node.type) {
    case "doc": {
      const children = Array.isArray(node.content) ? node.content : [];
      for (const child of children) {
        serializeRichNode(child, indent, target);
      }
      break;
    }
    case "paragraph": {
      const text = collectInlineText(node.content);
      addMultilineText(target, indent, text);
      break;
    }
    case "heading": {
      const levelRaw = node.attrs?.level;
      const level =
        typeof levelRaw === "number" && Number.isFinite(levelRaw)
          ? Math.min(Math.max(levelRaw, 1), 6)
          : 1;
      const text = collectInlineText(node.content);
      if (text) {
        addMultilineText(target, indent, `${"#".repeat(level)} ${text}`);
      }
      break;
    }
    case "bulletList": {
      const items = Array.isArray(node.content) ? node.content : [];
      for (const item of items) {
        serializeListItem(item, indent, target, { type: "bullet" });
      }
      break;
    }
    case "orderedList": {
      const items = Array.isArray(node.content) ? node.content : [];
      const startRaw = node.attrs?.start;
      const start =
        typeof startRaw === "number" && Number.isFinite(startRaw)
          ? Math.floor(startRaw)
          : 1;
      items.forEach((item, index) => {
        serializeListItem(item, indent, target, {
          type: "ordered",
          index: start + index,
        });
      });
      break;
    }
    case "blockquote": {
      const nested: string[] = [];
      const children = Array.isArray(node.content) ? node.content : [];
      for (const child of children) {
        serializeRichNode(child, 0, nested);
      }
      for (const line of nested) {
        if (line) {
          addMultilineText(target, indent, `> ${line}`);
        } else {
          target.push("");
        }
      }
      break;
    }
    case "horizontalRule": {
      addMultilineText(target, indent, "------");
      break;
    }
    case "codeBlock": {
      const code = collectInlineText(node.content);
      if (code) {
        addMultilineText(target, indent, code);
      }
      break;
    }
    case "text": {
      const text = typeof node.text === "string" ? node.text : "";
      if (text) {
        addMultilineText(target, indent, text);
      }
      break;
    }
    default: {
      const children = Array.isArray(node.content) ? node.content : [];
      if (children.length > 0) {
        for (const child of children) {
          serializeRichNode(child, indent, target);
        }
      } else {
        const fallback = formatHumanReadable(node);
        if (fallback) {
          addMultilineText(target, indent, fallback);
        }
      }
    }
  }
}

export function formatRichText(value: unknown): string {
  if (!isTiptapDoc(value)) {
    return value ? formatHumanReadable(value) : "";
  }

  const lines: string[] = [];
  serializeRichNode(value, 0, lines);

  if (lines.length === 0) {
    return "";
  }

  return lines
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n")
    .trim();
}
