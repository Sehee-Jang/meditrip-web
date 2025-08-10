import { User } from "@/types/user";
import type { CommunityCategory } from "@/types/category";

export interface Question {
  id: string;
  title: string;
  content: string;
  category: CommunityCategory;
  createdAt: string;
  updatedAt?: string;

  imageUrl?: string;
  userId?: string;
  user?: Partial<User>; // 선택: 조회 시 작성자 정보 합쳐서 내려줄 때

  // 배열 집계 필드
  answersCount: number; // 기본 0
  isHidden?: boolean; // 기본 false
}

/** 답변(answers 서브컬렉션의 뷰 모델) */
export interface AnswerItem {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  adminId: string; // 답변 작성자(관리자) uid
  repliesCount: number; // 기본 0
}

/** 답글(replies 서브컬렉션의 뷰 모델) */
export interface ReplyItem {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  adminId: string; // 답글 작성자(관리자) uid
}
