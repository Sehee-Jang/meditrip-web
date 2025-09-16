// src/components/admin/articles/ArticlesAdminClient.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FilterRow, SelectFilter } from "../common/FilterControls";
import { CATEGORY_KEYS, CATEGORY_LABELS_KO } from "@/constants/categories";
import SearchInput from "@/components/common/SearchInput";
import IconOnlyAddButton from "../common/IconOnlyAddButton";
import ArticlesTable from "./ArticlesTable";
import { Article } from "@/types/articles";
import { toast } from "sonner";
import ArticlesFormDialog from "./ArticlesFormDialog";
import { useArticles } from "@/hooks/useArticles";
import { titleFor, excerptFor } from "@/utils/articles";

type CatFilter = "all" | (typeof CATEGORY_KEYS)[number];

export default function ArticlesAdminClient() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [cat, setCat] = useState<CatFilter>("all");

  const {
    data: rows,
    isFetching,
    refetch,
    error,
  } = useArticles({ includeHidden: true, limit: 100 });

  useEffect(() => {
    if (error) toast.error("목록을 불러오지 못했어요.");
  }, [error]);

  const items = useMemo<Article[]>(() => rows ?? [], [rows]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw && cat === "all") return items;

    return items.filter((w) => {
      if (cat !== "all" && w.category !== cat) return false;
      if (!kw) return true;
      return (
        titleFor(w, "ko").toLowerCase().includes(kw) ||
        titleFor(w, "ja").toLowerCase().includes(kw) ||
        excerptFor(w, "ko").toLowerCase().includes(kw) ||
        excerptFor(w, "ja").toLowerCase().includes(kw) ||
        CATEGORY_LABELS_KO[w.category].toLowerCase().includes(kw) ||
        w.category.toLowerCase().includes(kw) ||
        w.tags.some((t) => t.toLowerCase().includes(kw))
      );
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
        onChanged={() => void refetch?.()}
      />

      {open && (
        <ArticlesFormDialog
          id=''
          open
          onOpenChange={setOpen}
          onCreated={() => void refetch?.()}
        />
      )}
    </section>
  );
}
