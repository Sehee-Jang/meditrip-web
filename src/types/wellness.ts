import type { CategoryKey } from "@/constants/categories";
import type { DateInput } from "@/utils/date";
import type { FieldValue } from "firebase/firestore";
import type { LocaleKey } from "@/constants/locales";

// 다국어 문서 형태
export type LocalizedTextDoc = Record<LocaleKey, string>;

export interface Wellness {
  id: string;
  title: string;
  excerpt: string; // 목록/메타 설명용 요약문
  body: string; // 실제 콘텐츠 본문
  category: CategoryKey;
  tags: string[]; // 주제/속성 기반 필터 & 추천
  thumbnailUrl: string;

  viewCount: number;
  likeCount: number;
  isHidden: boolean;

  createdAt: string;
  updatedAt: string;
}

/** Firestore 실제 저장 형태(읽기 원본) */
export type WellnessDoc = {
  title?: LocalizedTextDoc | string;
  excerpt?: LocalizedTextDoc | string;
  body?: LocalizedTextDoc | string;
  category?: string;
  tags?: string[];
  thumbnailUrl?: string | null;

  viewCount?: number;
  likeCount?: number;
  isHidden?: boolean;

  createdAt?: DateInput | FieldValue;
  updatedAt?: DateInput | FieldValue;
};

/** 생성 입력 */
export type CreateWellnessInput = {
  title: string | LocalizedTextDoc;
  excerpt: string | LocalizedTextDoc;
  body: string | LocalizedTextDoc;
  category: CategoryKey;
  tags: string[];
  thumbnailUrl: string;
  isHidden?: boolean;
};

export type UpdateWellnessInput = Partial<CreateWellnessInput>;
