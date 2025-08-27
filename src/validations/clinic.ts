import { z } from "zod";
import {
  localizedRequiredDynamicSchema,
  localizedOptionalDynamicSchema,
  localizedNumberSchema,
} from "./common";

import type {
  DayOfWeek,
  TimeHHmm,
} from "@/types/clinic";

/** ===== 공통 ===== */
export const geoSchema = z
  .object({
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    placeId: z.string().optional(),
    formattedAddress: z.string().optional(),
  })
  .refine(
    (g) =>
      (g.lat == null && g.lng == null) ||
      (typeof g.lat === "number" && typeof g.lng === "number"),
    { message: "위도/경도는 함께 입력하세요.", path: ["lat"] }
  )
  .optional();

/** ===== 영업시간/편의시설/SNS 스키마 ===== */
/** 공통 유틸: 빈 문자열이면 undefined로 */
const toOptional = <S extends z.ZodTypeAny>(schema: S) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    schema.optional()
  );

/** ===== Day enum ===== */
export const dayEnum = z.enum(
  ["mon","tue","wed","thu","fri","sat","sun"] as [DayOfWeek, ...DayOfWeek[]]
);

/** ===== HH:mm (00:00~23:59) ===== */
const hhmm = z.string()
  .regex(/^\d{2}:\d{2}$/, "HH:mm 형식이어야 합니다.")
  .transform((v, ctx) => {
    const [hStr, mStr] = v.split(":");
    const h = Number(hStr), m = Number(mStr);
    const ok = Number.isInteger(h) && Number.isInteger(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59;
    if (ok) return v as TimeHHmm;
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "유효한 시간이어야 합니다(HH:mm)." });
    return z.NEVER;
  });

const hhmmOptional = toOptional(hhmm);

/** 하루 구간: 둘 다 입력 or 둘 다 비움 */
const dailyRangeLoose = z.object({
  open: hhmmOptional,
  close: hhmmOptional,
}).refine(
  (v) => (!!v.open && !!v.close) || (!v.open && !v.close),
  { message: "시작·종료시간은 짝으로 입력하거나 비워두세요.", path: ["open"] }
);

/** 주간 영업시간(요일별 optional 배열) → 유효 구간만 남기기 */
const weeklyHoursLoose = z.object({
  mon: z.array(dailyRangeLoose).optional(),
  tue: z.array(dailyRangeLoose).optional(),
  wed: z.array(dailyRangeLoose).optional(),
  thu: z.array(dailyRangeLoose).optional(),
  fri: z.array(dailyRangeLoose).optional(),
  sat: z.array(dailyRangeLoose).optional(),
  sun: z.array(dailyRangeLoose).optional(),
});
const weeklyHoursSchema = weeklyHoursLoose.transform((obj) => {
  const out: Partial<Record<DayOfWeek, { open: TimeHHmm; close: TimeHHmm }[]>> = {};
  (["mon","tue","wed","thu","fri","sat","sun"] as DayOfWeek[]).forEach((d) => {
    const src = obj[d] ?? [];
    const valid = src.filter(
      (r): r is { open: TimeHHmm; close: TimeHHmm } => !!r.open && !!r.close
    );
    if (valid.length) out[d] = valid;
  });
  return out;
});

/** ===== 소셜 “아이디” 스키마 (URL 아님) ===== */
const INSTAGRAM_ID = /^[a-z0-9._]{1,30}$/;          // 소문자/숫자/._, 1~30
const GENERIC_ID   = /^[A-Za-z0-9._-]{1,50}$/;      // 라인/왓츠앱 공통

const instagramIdSchema = toOptional(
  z.string()
    .transform((s) => s.trim().toLowerCase())
    .refine((s) => INSTAGRAM_ID.test(s), "인스타 아이디 형식이 아닙니다.")
);

const lineIdSchema = toOptional(
  z.string()
    .transform((s) => s.trim())
    .transform((s) => (s.startsWith("@") ? s.slice(1) : s))
    .refine((s) => GENERIC_ID.test(s), "LINE 아이디 형식이 아닙니다.")
);

// ✅ WhatsApp “ID” (전화번호 아님)
const whatsappIdSchema = toOptional(
  z.string()
    .transform((s) => s.trim())
    .refine((s) => GENERIC_ID.test(s), "WhatsApp ID 형식이 아닙니다.")
);

const socialsSchema = z.object({
  instagram: instagramIdSchema,
  line: lineIdSchema,
  whatsapp: whatsappIdSchema,
}).partial();

/** ===== 전화번호/웹사이트 ===== */
// 전화번호: +, 숫자, (), -, ., 공백 허용 (하이픈 필수 아님)
const phoneSchema = toOptional(
  z.string().refine(
    (s) => /^[+0-9()\-.\s]{3,20}$/.test(s),
    "전화번호 형식이 아닙니다."
  )
);

// 웹사이트: 빈 값 허용, 있으면 URL 형식
const websiteSchema = toOptional(z.string().url());

const amenitiesEnum = z.enum([
  "parking",
  "freeWifi",
  "infoDesk",
  "privateCare",
  "airportPickup",
]);

/** ===== 병원 폼 ===== */
export const clinicFormSchema = z.object({
  name: localizedRequiredDynamicSchema,
  address: localizedRequiredDynamicSchema,
  geo: geoSchema.optional(),
  intro: z.object({
    title: localizedOptionalDynamicSchema, // 입력 안받음(유지용)
    subtitle: localizedOptionalDynamicSchema, // 선택 입력
  }),
  category: z.enum(["traditional", "cosmetic", "wellness"]).optional(),
  vision: localizedOptionalDynamicSchema,
  mission: localizedOptionalDynamicSchema,
  description: localizedOptionalDynamicSchema,
  events: z
    .object({ ko: z.array(z.string()), ja: z.array(z.string()) })
    .default({ ko: [], ja: [] })
    .optional(),
  images: z.array(z.string()).default([]),

  tagKeys: z.array(z.string()).optional(),
  phone: phoneSchema,
  website: websiteSchema,
  socials: socialsSchema.optional(),
  weeklyHours: weeklyHoursSchema.optional(),
  weeklyClosedDays: z.array(dayEnum).optional(),
  hoursNote: localizedOptionalDynamicSchema.optional(),
  amenities: z.array(amenitiesEnum).optional(),

  // 폼에서 숨기지만 값은 유지
  isFavorite: z.boolean().default(false),
  rating: z.number().min(0).default(0),
  reviewCount: z.number().min(0).default(0),
  status: z.enum(["visible", "hidden"]).default("visible"),
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
