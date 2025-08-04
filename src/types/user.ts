export interface User {
  id: string; // uid
  nickname: string;
  email: string;
  photoURL?: string; // 구글 로그인 시 포함됨
  points?: number;
  agreeTerms: boolean;
  agreeMarketing: boolean;
  createdAt?: Date | string;
  isAnonymous?: boolean;
}
