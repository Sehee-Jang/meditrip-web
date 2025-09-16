"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FilterRow, SelectFilter } from "../common/FilterControls";
import { CATEGORY_KEYS, CATEGORY_LABELS_KO } from "@/constants/categories";
import SearchInput from "@/components/common/SearchInput";
import IconOnlyAddButton from "../common/IconOnlyAddButton";
import ArticlesTable from "./ArticlesTable";
import { Article } from "@/types/articles";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { listArticles } from "@/services/articles/listArticles";
import ArticlesFormDialog from "./ArticlesFormDialog";

type CatFilter = "all" | (typeof CATEGORY_KEYS)[number];

export default function ArticlesAdminClient() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [cat, setCat] = useState<CatFilter>("all");

  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ["admin-articles", { cat, keyword }],
    // 관리자: 숨김 포함
    queryFn: () => listArticles({ includeHidden: true, limit: 100 }),
  });

  useEffect(() => {
    if (error) toast.error("목록을 불러오지 못했어요.");
  }, [error]);

  const items = useMemo<Article[]>(() => data?.items ?? [], [data]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const hasKw = kw.length > 0;

    return items.filter((w) => {
      // 카테고리 필터(단일)
      const hitCat = cat === "all" ? true : w.category === cat;
      if (!hitCat) return false;

      // 키워드 없으면 카테고리만으로 통과
      if (!hasKw) return true;

      // ko/ja + 카테고리 라벨/키 + 태그 검색
      const hitKw =
        w.title.ko.toLowerCase().includes(kw) ||
        w.title.ja.toLowerCase().includes(kw) ||
        w.excerpt.ko.toLowerCase().includes(kw) ||
        w.excerpt.ja.toLowerCase().includes(kw) ||
        // 본문은 JSON이므로 목록검색엔 excerpt/제목/태그만 사용 권장
        CATEGORY_LABELS_KO[w.category].toLowerCase().includes(kw) ||
        w.category.toLowerCase().includes(kw) ||
        w.tags.some((t) => t.toLowerCase().includes(kw));
      return hitKw;
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
            label='아티클 추가'
            ariaLabel='아티클 추가'
            onClick={() => setOpen(true)}
          />
        </div>
      </div>

      <ArticlesTable
        items={filtered}
        totalCount={items.length}
        loading={isFetching}
        onChanged={() => void refetch()}
      />

      {/* 생성 다이얼로그 */}
      {open && (
        <ArticlesFormDialog
          id='' // 빈 문자열이면 create 모드
          open
          onOpenChange={setOpen}
          onCreated={() => void refetch()}
        />
      )}
    </section>
  );
}
