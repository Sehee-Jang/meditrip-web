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

export function formatArray(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
      .join("\n");
  }
  return "";
}

export function formatJson(value: unknown): string {
  return value ? JSON.stringify(value) : "";
}
