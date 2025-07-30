"use client";

import { useTranslations } from "next-intl";
import { mockShorts } from "@/data/mockData";
import VideoListSection from "./VideoListSection";
import { CategoryKey } from "@/constants/categories";
import { VideoItem } from "@/types/Video";

type Props = {
  keyword?: string;
};

export default function GroupedVideoSection({ keyword = "" }: Props) {
  const t = useTranslations("categories");

  const filtered = mockShorts.filter(
    (v) => v.title.includes(keyword) || v.category.includes(keyword)
  );

  const grouped = filtered.reduce((acc, video) => {
    const item: VideoItem = {
      id: video.id,
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      thumbnailUrl: video.thumbnail,
      viewCount: Math.floor(Math.random() * 10000 + 500),
      category: video.category,
    };

    if (!acc[video.category]) acc[video.category] = [];
    acc[video.category].push(item);
    return acc;
  }, {} as Record<CategoryKey, VideoItem[]>);

  return (
    <>
      {Object.entries(grouped).map(([categoryKey, videos]) => (
        <VideoListSection
          key={categoryKey}
          title={t(categoryKey)} // t("categories")[categoryKey]와 동일
          videos={videos}
        />
      ))}
    </>
  );
}
