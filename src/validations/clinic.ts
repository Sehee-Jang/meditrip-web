import { z } from "zod";
import {
  localizedRequiredDynamicSchema,
  localizedNumberSchema,
} from "./common";
import { LOCALES_TUPLE, type LocaleKey } from "@/constants/locales";

// 요일 키 (UI와 동일)
export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

// 공통: 로케일 문자열 동적 스키마 (누락 키는 ""로 채움)
const localizedStringDynamicSchema: z.ZodType<Record<LocaleKey, string>> = z
  .record(z.enum(LOCALES_TUPLE), z.string())
  .transform((m) => {
    const out = {} as Record<LocaleKey, string>;
    LOCALES_TUPLE.forEach((k) => {
      out[k] = typeof m[k] === "string" ? m[k] : "";
    });
    return out;
  });

// 공통: 로케일 문자열 배열 동적 스키마 (누락 키는 []로 채움)
const localizedStringArrayDynamicSchema: z.ZodType<Record<LocaleKey, string[]>> =
  z
    .record(z.enum(LOCALES_TUPLE), z.array(z.string().trim()))
    .transform((m) => {
      const out = {} as Record<LocaleKey, string[]>;
      LOCALES_TUPLE.forEach((k) => {
        out[k] = Array.isArray(m[k]) ? m[k] : [];
      });
      return out;
    });

    // 기본값 헬퍼들(Record<LocaleKey, ...>를 정확히 생성)
const makeLocalizedArray = (length = 0): Record<LocaleKey, string[]> => {
  const out = {} as Record<LocaleKey, string[]>;
  LOCALES_TUPLE.forEach((k) => {
    out[k] = Array.from({ length }, () => "");
  });
  return out;
};

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
    youtube: z.string().optional(),
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
  name: localizedStringDynamicSchema,                   // ko/ja/zh/en
  photoUrl: z.string().url().optional().or(z.literal("")), // 빈 문자열 허용
  lines: localizedStringArrayDynamicSchema,             // ko/ja/zh/en 배열
});

// 메인 스키마
export const clinicFormSchema = z.object({
  // 기본/로케일 필드
  name: localizedStringDynamicSchema,
  address: localizedStringDynamicSchema,
  intro: z.object({
    title: localizedStringDynamicSchema,
    subtitle: localizedStringDynamicSchema,
  }),
  vision: localizedStringDynamicSchema,
  mission: localizedStringDynamicSchema,
  description: localizedStringDynamicSchema,
  hoursNote: localizedStringDynamicSchema, // 영업/휴무 안내문

  // 선택/부가
  category: z.string().optional(), // "traditional" | "cosmetic" | "wellness" 등을 문자열로 관리
  geo: geoSchema,

  // 이벤트/주의사항: 전 로케일(ko/ja/zh/en)
  events: localizedStringArrayDynamicSchema.default(makeLocalizedArray(0)),
  reservationNotices: localizedStringArrayDynamicSchema
    .transform((obj) => {
      const pad3 = (arr: string[]) =>
        arr.length >= 3 ? arr : [...arr, "", "", ""].slice(0, 3);
      const out = {} as Record<LocaleKey, string[]>;
      LOCALES_TUPLE.forEach((k) => {
        out[k] = pad3(obj[k]);
      });
      return out;
    })
    .default(makeLocalizedArray(3)),

  // 이미지/태그
  images: z.array(z.string().url().or(z.string().min(1))).default([]),
  tagKeys: z.array(z.string()).default([]),

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

  // 기타
  isFavorite: z.boolean().default(false),
  rating: z.number().default(0),
  reviewCount: z.number().default(0),
  status: z.enum(["visible", "hidden"]).default("visible"),

  // 의료진
  doctors: z.array(doctorSchema).default([]),
});

export type ClinicFormValues = z.infer<typeof clinicFormSchema>;


/** ===== 패키지 폼 ===== */
const imageUrlOptional = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().url().optional()
);

export const treatmentStepSchema = z.object({
  title: localizedRequiredDynamicSchema,
  description: localizedRequiredDynamicSchema,
  imageUrl: imageUrlOptional,
});

export const packageFormSchema = z.object({
  title: localizedRequiredDynamicSchema,
  subtitle: localizedRequiredDynamicSchema.optional(), // 선택 입력
  price: localizedNumberSchema, // 숫자 필수(ko/ja)
  duration: localizedNumberSchema, // 숫자 필수(ko/ja, 분)
  packageImages: z.array(z.string()).optional(),
  treatmentDetails: z.array(treatmentStepSchema).optional(),
  precautions: localizedRequiredDynamicSchema.optional(),
});
export type PackageFormValues = z.infer<typeof packageFormSchema>;
