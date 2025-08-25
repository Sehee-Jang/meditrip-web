"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchInput from "@/components/common/SearchInput";
import {
  FilterRow,
  SelectFilter,
} from "@/components/admin/common/FilterControls";
import { CATEGORY_KEYS, CATEGORY_LABELS_KO } from "@/constants/categories";
import { listVideos } from "@/services/contents/videos.client";
import type { Video } from "@/types/video";
import VideoTable from "@/components/admin/shorts/VideoTable";
import VideoCreateDialog from "@/components/admin/shorts/VideoCreateDialog";
import { toast } from "sonner";
import IconOnlyAddButton from "../common/IconOnlyAddButton";

type CatFilter = "all" | (typeof CATEGORY_KEYS)[number];

export default function ContentAdminClient() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [cat, setCat] = useState<CatFilter>("all");

  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: () => listVideos({ limit: 100 }),
  });

  useEffect(() => {
    if (error) toast.error("콘텐츠 목록을 불러오지 못했어요.");
  }, [error]);

  const items = useMemo<Video[]>(() => (data ?? []) as Video[], [data]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return items.filter((v) => {
      const hitCat = cat === "all" ? true : v.category === cat;
      const hitKw =
        kw.length === 0 ||
        v.title.toLowerCase().includes(kw) ||
        v.category.toLowerCase().includes(kw);
      return hitCat && hitKw;
    });
  }, [items, keyword, cat]);

  return (
    <section className='space-y-4'>
      {/* 상단 툴바: 좌(검색/카테고리) · 우(영상 추가) */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <FilterRow>
          <SearchInput
            value={keyword}
            onChange={setKeyword}
            placeholder='제목 검색'
            aria-label='제목 검색'
            className='w-[260px]'
          />
          <SelectFilter<CatFilter>
            value={cat}
            onChange={setCat}
            aria-label='카테고리'
            options={[
              { value: "all", label: "모든 카테고리" },
              ...CATEGORY_KEYS.map((k) => ({
                value: k,
                label: CATEGORY_LABELS_KO[k],
              })),
            ]}
            triggerClassName='h-9 w-[160px] text-[13px]'
          />
        </FilterRow>

        <div className='flex shrink-0 items-center gap-2'>
          <IconOnlyAddButton
            label='영상 추가'
            ariaLabel='영상 추가'
            onClick={() => setOpen(true)}
          />
        </div>
      </div>

      {/* 목록 테이블 */}
      <VideoTable
        items={filtered}
        totalCount={items.length}
        loading={isFetching}
        onChanged={() => void refetch()}
      />

      {/* 생성 다이얼로그 */}
      <VideoCreateDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={() => {
          setOpen(false);
          void refetch();
        }}
      />
    </section>
  );
}
