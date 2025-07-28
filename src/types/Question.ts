export interface Answer {
  content: string;
  createdAt?: { toDate: () => Date };
  updatedAt?: { toDate: () => Date };
}

export interface User {
  id: string;
  name: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt?: { toDate: () => Date };
  imageUrl?: string;
  userId?: string;
  user?: User;
  answers?: Answer[];
}
