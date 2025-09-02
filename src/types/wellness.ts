import type { CategoryKey } from "@/constants/categories";
import type { DateInput } from "@/utils/date";
import type { FieldValue } from "firebase/firestore";
import { LocalizedTextDoc } from "./common";

/** Firestore 저장용 */
export interface Wellness {
  id: string;
  title: LocalizedTextDoc;
  excerpt: LocalizedTextDoc; // 목록/메타 설명용 요약문
  body: LocalizedTextDoc; // 실제 콘텐츠 본문
  categoryKeys?: CategoryKey;

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
  categoryKeys?: CategoryKey;
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
