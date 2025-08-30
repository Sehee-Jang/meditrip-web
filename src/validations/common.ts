import { z } from "zod";
import {
  LOCALES_TUPLE,
  REQUIRED_LOCALES,
  type LocaleKey,
} from "@/constants/locales";

export type LocalizedMap<T> = Record<LocaleKey, T>;
// 모든 언어 키를 string으로 강제
export type LocalizedTextFull = Record<LocaleKey, string>;

// 모든 언어 키를 공백으로 채워 일관된 형태로 정규화
function normalizeLocalized(
  input: Partial<Record<LocaleKey, string>>
): LocalizedTextFull {
  const out = {} as LocalizedTextFull;
  for (const k of LOCALES_TUPLE) out[k] = input[k]?.trim() ?? "";
  return out;
}

// 값 스키마를 string | undefined 로 허용
const stringOrUndef = z.union([z.string(), z.undefined()]);

// 문자열(전부 선택): ko/ja 비어도 통과
export const localizedStringDynamicSchema: z.ZodType<
  Record<LocaleKey, string>
> = z.record(z.enum(LOCALES_TUPLE), z.string()).transform((m) => {
  const out = {} as Record<LocaleKey, string>;
  LOCALES_TUPLE.forEach((k) => {
    out[k] = typeof m[k] === "string" ? m[k] : "";
  });
  return out;
});

// 문자열(ko/ja 필수, 나머지 선택)
export const localizedRequiredDynamicSchema: z.ZodType<LocalizedTextFull> = z
  .record(z.enum(LOCALES_TUPLE), stringOrUndef)
  .transform((m) => normalizeLocalized(m))
  .refine((obj) => REQUIRED_LOCALES.every((k) => obj[k].length > 0), {
    message: `필수 언어(${REQUIRED_LOCALES.join(", ")})를 입력하세요.`,
  });

// 문자열(전부 선택)
export const localizedOptionalDynamicSchema: z.ZodType<LocalizedTextFull> = z
  .record(z.enum(LOCALES_TUPLE), stringOrUndef)
  .transform((m) => normalizeLocalized(m));

// 배열 항목은 공백 제거 후 빈 문자열은 버림
const arrayItem = z
  .string()
  .transform((s) => s.trim())
  .pipe(z.string().min(1));

// 배열(전부 선택): [] 허용, 각 항목은 1자 이상
export const localizedStringArrayDynamicSchema: z.ZodType<
  LocalizedMap<string[]>
> = z
  .record(z.enum(LOCALES_TUPLE), z.array(arrayItem).optional())
  .transform((m) => {
    const out = {} as { [K in LocaleKey]: string[] };
    for (const k of LOCALES_TUPLE) {
      // 키가 없으면 빈 배열로 채움
      out[k] = m[k] ?? [];
    }
    return out;
  });

// 숫자(ko/ja 필수, zh/en 선택)
// price/duration 같은 필드에서 사용
export const localizedNumberKoJaRequiredSchema = z.object({
  ko: z.coerce
    .number()
    .refine((v) => Number.isFinite(v), "숫자 입력")
    .nonnegative("0 이상"),
  ja: z.coerce
    .number()
    .refine((v) => Number.isFinite(v), "숫자 입력")
    .nonnegative("0 이상"),
  zh: z.coerce.number().optional(),
  en: z.coerce.number().optional(),
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

export const treatmentStepSchema = z.object({
  title: localizedRequiredDynamicSchema, // 단계 제목: ko/ja 필수
  description: localizedStringDynamicSchema, // 단계 설명: 선택
  imageUrl: z.string().url().optional(),
});
