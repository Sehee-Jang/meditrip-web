export type UserRole = "admin" | "user";

export type AppLocale = "ko" | "ja";

export interface User {
  id: string; // uid
  role: UserRole;
  nickname: string;
  email: string;
  photoURL?: string; // 구글 로그인 시 포함됨
  points?: number;
  agreeTerms: boolean;
  agreeMarketing: boolean;
  createdAt?: Date | string;
  isAnonymous?: boolean;
  preferredLocale?: AppLocale;
}
