import type { CommunityCategory } from "@/types/category";

export interface Question {
  id: string;
  title: string;
  content: string;
  category: CommunityCategory;
  imageUrl?: string;
  userId: string;
  isHidden?: boolean; // 기본 false
  createdAt: string;
  updatedAt?: string;

  // 배열 집계 필드
  answersCount: number; // 기본 0
  hasAnswer: boolean; // 기본 false
}

/** 답변(answers 서브컬렉션의 뷰 모델) */
export interface AnswerItem {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  adminId: string; // 답변 작성자(관리자) uid
}
