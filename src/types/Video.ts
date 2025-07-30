import type { CategoryKey } from "@/constants/categories";

export type VideoItem = {
  id: number;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  youtubeUrl: string;
  category: CategoryKey;
};
