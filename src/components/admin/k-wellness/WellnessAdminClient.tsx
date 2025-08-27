"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FilterRow, SelectFilter } from "../common/FilterControls";
import { CATEGORY_KEYS, CATEGORY_LABELS_KO } from "@/constants/categories";
import SearchInput from "@/components/common/SearchInput";
import IconOnlyAddButton from "../common/IconOnlyAddButton";
import WellnessTable from "./WellnessTable";
import { Wellness } from "@/types/wellness";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { listWellness } from "@/services/wellness/listWellness";
import WellnessFormDialog from "./WellnessFormDialog";

type CatFilter = "all" | (typeof CATEGORY_KEYS)[number];

export default function WellnessAdminClient() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [cat, setCat] = useState<CatFilter>("all");

  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ["admin-wellness", { cat, keyword }],
    // 관리자: 숨김 포함
    queryFn: () => listWellness({ includeHidden: true, limit: 100 }),
  });

  useEffect(() => {
    if (error) toast.error("목록을 불러오지 못했어요.");
  }, [error]);

  const items = useMemo<Wellness[]>(() => data?.items ?? [], [data]);

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
            label='콘텐츠 추가'
            ariaLabel='콘텐츠 추가'
            onClick={() => setOpen(true)}
          />
        </div>
      </div>

      <WellnessTable
        items={filtered}
        totalCount={items.length}
        loading={isFetching}
        onChanged={() => void refetch()}
      />

      {/* 생성 다이얼로그 */}
      {open && (
        <WellnessFormDialog
          id='' // 빈 문자열이면 create 모드
          open
          onOpenChange={setOpen}
          onCreated={() => void refetch()}
        />
      )}
    </section>
  );
}
