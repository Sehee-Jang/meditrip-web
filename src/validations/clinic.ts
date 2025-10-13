import { z } from "zod";
import {
  localizedRequiredDynamicSchema,
  localizedNumberKoJaRequiredSchema,
  localizedStringDynamicSchema,
  localizedStringArrayDynamicSchema,
  treatmentStepSchema,
  treatmentProcessStepSchema,
} from "./common";
import {
  LOCALES_TUPLE,
  type LocaleKey,
  REQUIRED_LOCALES,
} from "@/constants/locales";
import { CATEGORY_KEYS, type CategoryKey } from "@/constants/categories";
import type { JSONContent } from "@/types/tiptap";

// 요일 키 (UI와 동일)
export const DAY_KEYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;
export type DayKey = (typeof DAY_KEYS)[number];

// 시간 형태(HH:mm). 빈 문자열/undefined도 허용
const timeHHmm = z.string().regex(/^\d{2}:\d{2}$/);
const timeMaybe = z.union([timeHHmm, z.literal(""), z.undefined()]);

// 요일별 시간 범위
const timeRangeSchema = z.object({
  open: timeMaybe,
  close: timeMaybe,
});

// 주간 영업시간 (요일별 시간대 배열, 일부 요일만 존재해도 허용)
const weeklyHoursSchema: z.ZodType<
  Partial<Record<DayKey, Array<{ open?: string; close?: string }>>>
> = z.object({
  mon: z.array(timeRangeSchema).optional(),
  tue: z.array(timeRangeSchema).optional(),
  wed: z.array(timeRangeSchema).optional(),
  thu: z.array(timeRangeSchema).optional(),
  fri: z.array(timeRangeSchema).optional(),
  sat: z.array(timeRangeSchema).optional(),
  sun: z.array(timeRangeSchema).optional(),
});

// 연락처/SNS
const socialsSchema = z
  .object({
    instagram: z.string().optional(),
    line: z.string().optional(),
    whatsapp: z.string().optional(),
  })
  .partial();

// 좌표
const geoSchema = z
  .object({
    lat: z.number().optional(),
    lng: z.number().optional(),
  })
  .optional();

// 의료진
const doctorSchema = z.object({
  name: localizedStringDynamicSchema, // ko/ja/zh/en
  photoUrl: z.string().url().optional().or(z.literal("")), // 빈 문자열 허용
  lines: localizedStringArrayDynamicSchema, // ko/ja/zh/en 배열
});

// 카테고리 키 유효성 (기존 카테고리 키만 허용)
const categoryKeysSchema = z
  .array(
    z.custom<CategoryKey>(
      (val) =>
        typeof val === "string" && CATEGORY_KEYS.includes(val as CategoryKey),
      "유효하지 않은 카테고리입니다."
    )
  )
  .min(1, "카테고리를 1개 이상 선택하세요.")
  .default([]);

// Tiptap JSON 최소 구조만 강제(나머지는 통과)
const tiptapDocSchema = z
  .object({ type: z.literal("doc") })
  .passthrough() as z.ZodType<JSONContent>;

/**
 * 로케일 배열과 필수 로케일 배열을 받아 LocalizedRichText 스키마를 생성
 * - requiredLocales 에 포함된 키는 필수
 * - 그 외 LOCALES_TUPLE 키는 선택
 * - 정의되지 않은 추가 키는 거부(strict)
 */
function makeLocalizedRichTextSchema(
  locales: readonly LocaleKey[],
  requiredLocales: readonly LocaleKey[]
) {
  const shape = Object.fromEntries(
    locales.map((lc) => [
      lc,
      requiredLocales.includes(lc)
        ? tiptapDocSchema
        : tiptapDocSchema.optional(),
    ])
  ) as Record<LocaleKey, z.ZodType<JSONContent | undefined>>;

  return z
    .object(shape)
    .strict()
    .refine(
      (obj) => requiredLocales.every((lc) => !!obj[lc]),
      `필수 언어(${requiredLocales.join(", ")})는 비울 수 없습니다.`
    );
}

// 필요 시 재사용 가능하도록 export
export const localizedRichText = makeLocalizedRichTextSchema(
  LOCALES_TUPLE,
  REQUIRED_LOCALES
);

// 메인 스키마
export const clinicFormSchema = z.object({
  // ko/ja 필수, zh/en 선택
  name: localizedRequiredDynamicSchema,
  address: localizedRequiredDynamicSchema,

  isExclusive: z.boolean().default(false),
  // 모두 선택
  intro: z.object({
    title: localizedStringDynamicSchema,
    subtitle: localizedStringDynamicSchema,
  }),

  description: localizedRichText,
  highlights: localizedRichText,
  hoursNote: localizedStringDynamicSchema,

  categoryKeys: categoryKeysSchema,
  geo: geoSchema,
  events: localizedStringArrayDynamicSchema,
  reservationNotices: localizedStringArrayDynamicSchema
    .transform((obj) => {
      const out = {} as Record<LocaleKey, string[]>;
      LOCALES_TUPLE.forEach((k) => {
        const src = Array.isArray(obj[k]) ? obj[k] : [];
        out[k] = src.filter(
          (s) => typeof s === "string" && s.trim().length > 0
        );
      });
      return out;
    })
    .default({ ko: [], ja: [], zh: [], en: [] }),

  // 이미지/태그
  images: z.array(z.string().url().or(z.string().min(1))).default([]),
  tagSlugs: z.array(z.string()).default([]),

  // 연락처/웹/SNS
  phone: z.string().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  socials: socialsSchema.default({}),

  // 영업 정보
  weeklyHours: weeklyHoursSchema.default({}),
  weeklyClosedDays: z
    .array(z.enum(["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const))
    .default([]),

  // 편의시설(문자열 키 배열)
  amenities: z.array(z.string()).default([]),

  rating: z.number().default(0),
  reviewCount: z.number().default(0),
  status: z.enum(["visible", "hidden"]).default("visible"),

  // 의료진
  doctors: z.array(doctorSchema).default([]),
});

export type ClinicFormValues = z.infer<typeof clinicFormSchema>;

/** ===== 패키지 폼 ===== */
export const packageFormSchema = z.object({
  // ko/ja만 필수
  title: localizedRequiredDynamicSchema,

  // 부제/주의사항 등은 선택
  subtitle: localizedStringDynamicSchema,
  precautions: localizedStringDynamicSchema,

  // 가격은 ko/ja 필수 숫자, zh/en 선택 숫자
  price: localizedNumberKoJaRequiredSchema,
  duration: z.coerce
    .number()
    .refine((v) => Number.isFinite(v), "숫자 입력")
    .min(0, "0 이상"),
  packageImages: z.array(z.string().url()).min(1, "이미지 1장 이상"),
  treatmentProcess: z.array(treatmentProcessStepSchema).default([]),
  treatmentDetails: z.array(treatmentStepSchema).default([]),
});
export type PackageFormValues = z.infer<typeof packageFormSchema>;
