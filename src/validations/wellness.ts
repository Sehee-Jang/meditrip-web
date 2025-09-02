import { z } from "zod";
import { CATEGORY_VALUES_TUPLE } from "@/constants/categories";
import {
  localizedRequiredDynamicSchema,
  localizedStringDynamicSchema,
  tagsOptionalSchema,
} from "./common";

/** ===== 폼 스키마 =====
 * 필수: title, body, category
 * 선택: excerpt, tags, images
 * ko/ja 필수, zh/en 선택
 * isHidden: 생성 폼에선 숨김(기본 false), 리스트에서 토글 관리
 */
export const wellnessFormSchema = z.object({
  // 필수
  title: localizedRequiredDynamicSchema,
  body: localizedRequiredDynamicSchema,
  category: z.enum(CATEGORY_VALUES_TUPLE),

  // 선택
  excerpt: localizedStringDynamicSchema,
  tags: tagsOptionalSchema,
  images: z.array(z.string().trim().min(1)).optional().default([]),

  // 생성 폼에서는 숨김 처리(기본 false), 리스트에서 토글
  isHidden: z.boolean().default(false),
});

export type WellnessFormValues = z.infer<typeof wellnessFormSchema>;
