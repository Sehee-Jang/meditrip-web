import { z } from "zod";
import { CATEGORY_VALUES_TUPLE } from "@/constants/categories";
import {
  LOCALES_TUPLE,
  REQUIRED_LOCALES,
  type LocaleKey,
} from "@/constants/locales";
import type { JSONContent } from "@tiptap/core";

/** 빈 Tiptap 문서 */
const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

/** Tiptap JSON 검증 + JSONContent 타입으로 추론 */
const tiptapJsonSchema = z.custom<JSONContent>(
  (v) =>
    !!v && typeof v === "object" && (v as { type?: unknown }).type === "doc",
  { message: "유효한 Tiptap 문서가 아닙니다." }
);

/** ko/ja 필수, 나머지 선택: 문자열 레코드 (Record<LocaleKey, string>) */
const localizedString = z
  .record(z.enum(LOCALES_TUPLE), z.string().default(""))
  .superRefine((obj, ctx) => {
    for (const loc of REQUIRED_LOCALES) {
      if (!obj[loc] || obj[loc].trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `텍스트(${loc})은 필수입니다.`,
          path: [loc],
        });
      }
    }
  });

/**
 * ko/ja 필수, 나머지 선택: Tiptap JSON
 * - 입력(FormIn): Record<LocaleKey, JSONContent | undefined>
 * - 출력(FormOut): Record<LocaleKey, JSONContent>  ← transform으로 EMPTY_DOC 채움
 */
const localizedRichRequired = z
  .record(z.enum(LOCALES_TUPLE), tiptapJsonSchema.optional())
  .superRefine((obj, ctx) => {
    for (const loc of REQUIRED_LOCALES) {
      if (!obj[loc]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `본문(${loc})은 필수입니다.`,
          path: [loc],
        });
      }
    }
  })
  .transform((obj) => {
    const out = {} as Record<LocaleKey, JSONContent>;
    for (const loc of LOCALES_TUPLE) out[loc] = obj[loc] ?? EMPTY_DOC;
    return out;
  });

// 카테고리 리터럴 타입
type CategoryValue = (typeof CATEGORY_VALUES_TUPLE)[number];

// 타입 가드
function isCategoryValue(v: unknown): v is CategoryValue {
  return (
    typeof v === "string" &&
    (CATEGORY_VALUES_TUPLE as readonly string[]).includes(v)
  );
}

// ✔ 카테고리 스키마: 한글 메시지(필수/허용값 아님 구분)
const categorySchema: z.ZodType<CategoryValue> = z
  .unknown()
  .superRefine((v, ctx) => {
    // 선택 안 함/빈값
    if (typeof v !== "string" || v.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "카테고리를 선택해 주세요.",
      });
      return;
    }
    // 목록 외 값
    if (!isCategoryValue(v)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "지원하지 않는 카테고리입니다. 목록에서 선택해 주세요.",
      });
    }
  })
  .transform((v) => v as CategoryValue);

export const articlesFormSchema = z.object({
  title: localizedString,
  excerpt: localizedString,
  body: localizedRichRequired,
  category: categorySchema,
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  images: z.array(z.string().trim().min(1)).optional().default([]),
  status: z.enum(["visible", "hidden"]).default("visible"),
});

export type ArticlesFormValues = z.infer<typeof articlesFormSchema>;
