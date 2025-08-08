import { User } from "@/types/user";
import type { CommunityCategory } from "@/types/category";

export interface Answer {
  content: string;
  createdAt?: string; // 앱 레이어에선 문자열 일관화
  updatedAt?: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  category: CommunityCategory;
  createdAt: string;
  imageUrl?: string;
  userId?: string;
  user?: User;
  answers?: Answer[];
}
