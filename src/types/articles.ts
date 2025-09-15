import type { Category } from "@/constants/categories";
import type { DateInput } from "@/utils/date";
import type { FieldValue } from "firebase/firestore";
import { LocalizedRichTextDoc, LocalizedTextDoc } from "./common";

/** Firestore 저장용 */
export interface Article {
  id: string;
  title: LocalizedTextDoc;
  excerpt: LocalizedTextDoc; // 목록/메타 설명용 요약문
  body: LocalizedRichTextDoc; // 실제 콘텐츠 본문
  category: Category;
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
export type ArticleDoc = {
  title?: LocalizedTextDoc;
  excerpt?: LocalizedTextDoc;
  body?: LocalizedRichTextDoc;
  category: Category;
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
export type CreateArticleInput = {
  title: LocalizedTextDoc;
  excerpt: LocalizedTextDoc;
  body: LocalizedRichTextDoc;
  category: Category;
  // categories: CategoryKey[]; // 다중 카테고리
  tags: string[];
  images: string[];
  isHidden?: boolean;
};

export type UpdateArticleInput = Partial<CreateArticleInput>;

/** 병원 문서 + id (조회용) */
export type ArticleWithId = ArticleDoc & { id: string };
