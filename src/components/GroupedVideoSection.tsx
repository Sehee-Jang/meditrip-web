"use client";

import { useTranslations } from "next-intl";
import { mockShorts } from "@/data/mockData";
import { VideoItem } from "@/types/video";
import VideoListSection from "./VideoListSection";

const categoryMap: Record<string, string> = {
  스트레스: "stress",
  다이어트: "diet",
  면역관리: "immunity",
  여성질환: "women",
  안티에이징: "antiaging",
};

type Props = {
  keyword?: string;
};

export default function GroupedVideoSection({ keyword = "" }: Props) {
  const t = useTranslations("Contents");

  const filtered = mockShorts.filter(
    (v) => v.title.includes(keyword) || v.category.includes(keyword)
  );

  const grouped = filtered.reduce((acc, video) => {
    const item: VideoItem = {
      id: String(video.id),
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      thumbnailUrl: video.thumbnail,
      viewCount: Math.floor(Math.random() * 10000 + 500),
    };

    if (!acc[video.category]) acc[video.category] = [];
    acc[video.category].push(item);
    return acc;
  }, {} as Record<string, VideoItem[]>);

  return (
    <>
      {Object.entries(grouped).map(([categoryKr, videos]) => {
        const i18nKey = categoryMap[categoryKr as keyof typeof categoryMap];
        if (!i18nKey) return null;

        return (
          <VideoListSection
            key={i18nKey}
            title={t(`categories.${i18nKey}`)}
            videos={videos}
          />
        );
      })}
    </>
  );
}
