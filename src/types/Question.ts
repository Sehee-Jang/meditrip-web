import { User } from "@/types/User";

export interface Answer {
  content: string;
  createdAt?: { toDate: () => Date };
  updatedAt?: { toDate: () => Date };
}

export interface Question {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  imageUrl?: string;
  user?: User;
  answers?: Answer[];
}
