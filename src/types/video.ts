import type { CategoryKey } from "@/constants/categories";

export interface Video {
  id: string; // Firestore 문서 ID 기준 (mock에서는 String(video.id)로 매핑)
  title: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  viewCount?: number; // 선택값: 조회수 집계(추후 API 연동 시 서버 값 사용)
  category: CategoryKey;
  createdAt?: Date | string; // 추후 관리자 등록용
  updatedAt?: Date | string;
}
