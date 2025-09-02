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
  category: CategoryKey;
  // categories?: CategoryKey[]; // 다중 카테고리
  tags: string[]; // 주제/속성 기반 필터 & 추천
  images: string[];

  viewCount: number;
  likeCount: number;
  isHidden: boolean;

  createdAt: string;
  updatedAt: string;
}

/** Firestore 실제 저장 형태(읽기 원본) */
export type WellnessDoc = {
  title?: LocalizedTextDoc;
  excerpt?: LocalizedTextDoc;
  body?: LocalizedTextDoc;
  category: CategoryKey;
  // categories?: CategoryKey[]; // 다중 카테고리
  tags?: string[];
  images?: string[];

  viewCount?: number;
  likeCount?: number;
  isHidden?: boolean;

  createdAt?: DateInput | FieldValue;
  updatedAt?: DateInput | FieldValue;
};

/** 생성 입력 */
export type CreateWellnessInput = {
  title: LocalizedTextDoc;
  excerpt: LocalizedTextDoc;
  body: LocalizedTextDoc;
  category: CategoryKey;
  // categories: CategoryKey[]; // 다중 카테고리
  tags: string[];
  images: string[];
  isHidden?: boolean;
};

export type UpdateWellnessInput = Partial<CreateWellnessInput>;

/** 병원 문서 + id (조회용) */
export type WellnessWithId = WellnessDoc & { id: string };
