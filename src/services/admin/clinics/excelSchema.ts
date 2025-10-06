import { LOCALES_TUPLE } from "@/constants/locales";
import type {
  LocalizedRichTextDoc,
  LocalizedStringArray,
  LocalizedTextDoc,
} from "@/types/common";

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
  "duration_ko",
  "duration_ja",
  "packageImages",
  "treatmentDetailsJson",
  ...LOCALES_TUPLE.map((locale) => `precautions_${locale}`),
];

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
    target[key] = value?.[locale] ? JSON.stringify(value[locale]) : "";
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
