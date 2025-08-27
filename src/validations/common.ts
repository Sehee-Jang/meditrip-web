import { z } from "zod";
import {
  LOCALES_TUPLE,
  REQUIRED_LOCALES,
  type LocaleKey,
} from "@/constants/locales";

/** ---- 고정형(ko/ja) 스키마 ---- */
export const localizedFieldSchema = z.object({
  ko: z.string().trim().min(1, "한국어 필수"),
  ja: z.string().trim().min(1, "일본어 필수"),
});

export const localizedFieldOptionalSchema = z.object({
  ko: z.string().trim().optional().default(""),
  ja: z.string().trim().optional().default(""),
});

/** 숫자(ko/ja 필수) */
const numericRequired = z.coerce
  .number()
  .refine((v) => Number.isFinite(v) && !Number.isNaN(v), {
    message: "필수 입력",
  })
  .int("정수만 입력")
  .min(1, "1 이상 입력");

export const localizedNumberSchema = z.object({
  ko: numericRequired,
  ja: numericRequired,
});

/** 태그: 선택 + 중복제거 + 소문자 정규화 */
export const tagsOptionalSchema = z
  .array(z.string().trim().min(1))
  .optional()
  .default([])
  .transform((arr) => {
    const seen = new Set<string>();
    return arr
      .map((s) => s.toLowerCase())
      .filter((s) => {
        if (seen.has(s)) return false;
        seen.add(s);
        return true;
      });
  });

/** ---- 동적형(ko/ja 필수, zh/en 선택) 스키마 ---- */
export type LocalizedText = Partial<Record<LocaleKey, string>> & {
  ko: string;
  ja: string;
};

// 🔧 모든 언어 키를 string으로 강제
export type LocalizedTextFull = Record<LocaleKey, string>;

function normalizeLocalized(
  input: Partial<Record<LocaleKey, string>>
): LocalizedTextFull {
  const out = {} as LocalizedTextFull;
  for (const k of LOCALES_TUPLE) out[k] = input[k]?.trim() ?? "";
  return out;
}

/** ko/ja 필수, 나머지는 선택 */
export const localizedRequiredDynamicSchema: z.ZodType<LocalizedTextFull> = z
  .record(z.enum(LOCALES_TUPLE), z.string().trim())
  .transform((m) => normalizeLocalized(m))
  .refine((obj) => REQUIRED_LOCALES.every((k) => obj[k].length > 0), {
    message: `필수 언어(${REQUIRED_LOCALES.join(", ")})를 입력하세요.`,
  });

/** 전부 선택(미입력은 공백 채움) */
export const localizedOptionalDynamicSchema: z.ZodType<LocalizedTextFull> = z
  .record(z.enum(LOCALES_TUPLE), z.string().trim())
  .transform((m) => normalizeLocalized(m));
