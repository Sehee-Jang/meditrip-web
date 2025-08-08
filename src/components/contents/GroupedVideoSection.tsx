"use client";

import { useTranslations } from "next-intl";
import { mockShorts } from "@/data/mockData";
import VideoListSection from "./VideoListSection";
import { CategoryKey } from "@/constants/categories";
import { Video } from "@/types/video";

type Props = {
  keyword?: string;
  selectedCategories?: CategoryKey[];
};

export default function GroupedVideoSection({
  keyword = "",
  selectedCategories = [],
}: Props) {
  const t = useTranslations("categories");

  // mock → 통합 타입(Video)으로 매핑
  const normalized: Video[] = mockShorts.map((v) => ({
    id: String(v.id), // 숫자라면 문자열로 변환
    title: v.title,
    youtubeUrl: v.youtubeUrl,
    thumbnailUrl: v.thumbnail, // mock의 thumbnail → thumbnailUrl 로 정규화
    viewCount: Math.floor(Math.random() * 10000 + 500),
    category: v.category,
  }));

  const byKeyword = normalized.filter((v) => {
    const kw = keyword.trim();
    if (!kw) return true;
    return (
      v.title.toLowerCase().includes(kw.toLowerCase()) ||
      v.category.toLowerCase().includes(kw.toLowerCase())
    );
  });

  const byCategory =
    selectedCategories.length === 0
      ? byKeyword
      : byKeyword.filter((v) => selectedCategories.includes(v.category));

  const grouped = byCategory.reduce((acc, video) => {
    if (!acc[video.category]) acc[video.category] = [];
    acc[video.category].push(video);
    return acc;
  }, {} as Record<CategoryKey, Video[]>);

  const entries = Object.entries(grouped);

  return (
    <>
      {entries.length === 0 ? (
        <p className='text-center text-sm text-gray-500 py-8'>
          표시할 콘텐츠가 없습니다.
        </p>
      ) : (
        entries.map(([categoryKey, videos]) => (
          <VideoListSection
            key={categoryKey}
            title={t(categoryKey as CategoryKey)}
            videos={videos}
          />
        ))
      )}
    </>
  );
}
