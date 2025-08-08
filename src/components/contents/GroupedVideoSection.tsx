"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { mockShorts } from "@/data/mockData";
import VideoListSection from "./VideoListSection";
import { CategoryKey } from "@/constants/categories";
import { Video } from "@/types/video";
import { fetchVideos } from "@/services/contents/videos.client";

type Props = {
  keyword?: string;
  selectedCategories?: CategoryKey[];
};

export default function GroupedVideoSection({
  keyword = "",
  selectedCategories = [],
}: Props) {
  const t = useTranslations("categories");
  const useFs = process.env.NEXT_PUBLIC_USE_FIRESTORE === "1";
  const [items, setItems] = useState<Video[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!useFs) {
        // mock → Video 정규화
        const v: Video[] = mockShorts.map((m) => ({
          id: String(m.id),
          title: m.title,
          youtubeUrl: m.youtubeUrl,
          thumbnailUrl: m.thumbnail,
          viewCount: Math.floor(Math.random() * 10000 + 500),
          category: m.category,
        }));
        if (!cancelled) setItems(v);
        return;
      }
      const { items: fsItems } = await fetchVideos({
        categories: selectedCategories,
        keyword,
        limit: 50,
      });
      if (!cancelled) setItems(fsItems);
    };
    run();
    return () => {
      cancelled = true;
    };
    // 카테고리/키워드 변경 시 갱신
  }, [useFs, keyword, selectedCategories]);

  const byKeyword = items.filter((v) => {
    const kw = keyword.trim();
    if (!kw) return true;
    return (
      v.title.toLowerCase().includes(kw.toLowerCase()) ||
      v.category.toLowerCase().includes(kw.toLowerCase())
    );
  });

  // 카테고리 선택 O → 선택 카테고리만, 카테고리 선택 X → 그대로(byKeyword)
  const byCategory =
    selectedCategories.length === 0
      ? byKeyword
      : byKeyword.filter((v) => selectedCategories.includes(v.category));

  // 카테고리 미선택이면 "모아보기"로 단일 리스트 렌더
  if (selectedCategories.length === 0) {
    return byKeyword.length === 0 ? (
      <p className='text-center text-sm text-gray-500 py-8'>
        표시할 콘텐츠가 없습니다.
      </p>
    ) : (
      <VideoListSection title='전체 콘텐츠' videos={byKeyword} />
    );
  }

  // 카테고리 선택된 경우에만 기존처럼 그룹 섹션 렌더
  const grouped = byCategory.reduce((acc, video) => {
    if (!acc[video.category]) acc[video.category] = [];
    acc[video.category].push(video);
    return acc;
  }, {} as Record<CategoryKey, Video[]>);

  const entries = Object.entries(grouped);

  return entries.length === 0 ? (
    <p className='text-center text-sm text-gray-500 py-8'>
      표시할 콘텐츠가 없습니다.
    </p>
  ) : (
    <>
      {entries.map(([categoryKey, videos]) => (
        <VideoListSection
          key={categoryKey}
          title={t(categoryKey as CategoryKey)}
          videos={videos}
        />
      ))}
    </>
  );
}
