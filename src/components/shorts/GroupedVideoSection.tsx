"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import VideoListSection from "./VideoListSection";
import { CategoryKey } from "@/constants/categories";
import { Video } from "@/types/video";
import { listVideos } from "@/services/shorts/videos.client";
import CommonButton from "../common/CommonButton";

type Props = {
  keyword?: string;
  selectedCategories?: CategoryKey[];
  /** 한 페이지에 보여줄 개수 (기본 10) */
  pageSize?: number;
};

export default function GroupedVideoSection({
  keyword = "",
  selectedCategories = [],
  pageSize = 10,
}: Props) {
  const tCat = useTranslations("categories");
  const tCont = useTranslations("shorts-page");
  const [items, setItems] = useState<Video[]>([]);
  const [page, setPage] = useState(1);

  // 최초 1회만 가져오기
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // 필요 시 limit 조절 가능 (ex. 200)
      const fsItems = await listVideos({ limit: 200 });
      if (!cancelled) setItems(fsItems);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // 검색/카테고리 변경 시 페이지 리셋
  useEffect(() => {
    setPage(1);
  }, [keyword, selectedCategories]);

  // 필터링
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const byKw = kw
      ? items.filter(
          (v) =>
            v.title.toLowerCase().includes(kw) ||
            v.category.toLowerCase().includes(kw)
        )
      : items;

    if (selectedCategories.length === 0) return byKw;
    return byKw.filter((v) => selectedCategories.includes(v.category));
  }, [items, keyword, selectedCategories]);

  // 🧰 "모아보기"(카테고리 미선택) → 단일 리스트 + 더보기
  if (selectedCategories.length === 0) {
    const total = filtered.length;

    if (total === 0) {
      return (
        <p className='text-center text-sm text-muted-foreground py-8'>
          {tCont("noContentMessage")}
        </p>
      );
    }

    const visible = filtered.slice(0, page * pageSize);
    const hasMore = visible.length < total;

    return (
      <>
        <VideoListSection title={tCont("allContents")} videos={visible} />
        {hasMore && (
          <div className='text-center'>
            <CommonButton
              className='w-full md:w-[120px]'
              onClick={() => setPage((p) => p + 1)}
            >
              {tCont("viewMore")}
            </CommonButton>
          </div>
        )}
      </>
    );
  }
  // 🧩 카테고리 선택 시 → 그룹 섹션 (더보기 없이 전체 표시)
  const grouped = filtered.reduce((acc, video) => {
    (acc[video.category as CategoryKey] ??= []).push(video);
    return acc;
  }, {} as Record<CategoryKey, Video[]>);

  const entries = Object.entries(grouped);

  return entries.length === 0 ? (
    <p className='text-center text-sm text-muted-foreground py-8'>
      {tCont("noContentMessage")}
    </p>
  ) : (
    <>
      {entries.map(([categoryKey, videos]) => (
        <VideoListSection
          key={categoryKey}
          title={tCat(categoryKey as CategoryKey)}
          videos={videos}
        />
      ))}
    </>
  );
}
