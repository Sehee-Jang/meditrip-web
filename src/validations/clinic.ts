import { z } from "zod";

/** ===== 공통 ===== */
export const localizedFieldSchema = z.object({
  ko: z.string().min(1, "한국어 필수"),
  ja: z.string().min(1, "일본어 필수"),
});

export const localizedFieldOptionalSchema = z.object({
  ko: z.string().optional().default(""),
  ja: z.string().optional().default(""),
});

const numericRequired = z.coerce
  .number() // "10000" -> 10000, "" -> NaN
  .refine((v) => Number.isFinite(v) && !Number.isNaN(v), {
    message: "필수 입력",
  })
  .int("정수만 입력")
  .min(1, "1 이상 입력");

export const localizedNumberSchema = z.object({
  ko: numericRequired,
  ja: numericRequired,
});

export const geoSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  placeId: z.string().optional(),
  formattedAddress: z.string().optional(),
});

/** ===== 병원 폼 ===== */
export const clinicFormSchema = z.object({
  name: localizedFieldSchema,
  address: localizedFieldSchema,
  geo: geoSchema.optional(),
  intro: z.object({
    title: localizedFieldOptionalSchema, // 입력 안받음(유지용)
    subtitle: localizedFieldOptionalSchema, // 선택 입력
  }),
  category: z.enum(["traditional", "cosmetic", "wellness"]).optional(),
  vision: localizedFieldSchema,
  mission: localizedFieldSchema,
  description: localizedFieldSchema,
  events: z
    .object({ ko: z.array(z.string()), ja: z.array(z.string()) })
    .default({ ko: [], ja: [] }),
  images: z.array(z.string()).default([]),

  // 폼에서 숨기지만 값은 유지
  isFavorite: z.boolean().default(false),
  rating: z.number().min(0).default(0),
  reviewCount: z.number().min(0).default(0),
  status: z.enum(["visible", "hidden"]).default("visible"),
});
export type ClinicFormValues = z.infer<typeof clinicFormSchema>;

/** ===== 패키지 폼 ===== */
// SingleImageUploader가 ""를 줄 수 있어 이를 undefined로 정규화
const imageUrlOptional = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().url().optional()
);

export const treatmentStepSchema = z.object({
  title: localizedFieldSchema,
  description: localizedFieldSchema,
  imageUrl: imageUrlOptional,
});

export const packageFormSchema = z.object({
  title: localizedFieldSchema,
  subtitle: localizedFieldSchema.optional(), // 선택 입력
  price: localizedNumberSchema, // ✅ 숫자 필수(ko/ja)
  duration: localizedNumberSchema, // ✅ 숫자 필수(ko/ja, 분)
  packageImages: z.array(z.string()).optional(),
  treatmentDetails: z.array(treatmentStepSchema).optional(),
  precautions: localizedFieldSchema.optional(),
});
export type PackageFormValues = z.infer<typeof packageFormSchema>;
