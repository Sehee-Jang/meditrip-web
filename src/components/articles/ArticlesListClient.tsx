"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { listArticles } from "@/services/articles/listArticles";
import type { Article } from "@/types/articles";
import {
  CATEGORIES,
  type CategoryKey,
  type Category,
} from "@/constants/categories";
import { normalizeArticles } from "@/utils/articles";
import ArticleCard from "./ArticleCard";

type Props = {
  initialSelectedCategories: CategoryKey[];
  initialKeyword: string;
};

const PAGE_SIZE = 12;

export default function ArticlesListClient({
  initialSelectedCategories,
  initialKeyword,
}: Props) {
  const locale = useLocale() as keyof Article["title"]; // ko|ja|zh|en
  const [all, setAll] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<Set<CategoryKey>>(
    new Set(initialSelectedCategories)
  );
  const [keyword, setKeyword] = useState<string>(initialKeyword);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await listArticles(); // 타입 미정확 → unknown 취급
        const rows = normalizeArticles(res); // 안전하게 Article[]로 변환
        if (!alive) return;
        setAll(rows.filter((r) => !r.isHidden)); // <-- 이제 r: Article 로 추론됨
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const cats: Category[] =
      selected.size > 0 ? Array.from(selected).map((k) => CATEGORIES[k]) : [];
    const kw = keyword.trim().toLowerCase();
    return all.filter((a) => {
      const byCat = cats.length === 0 || cats.includes(a.category);
      const text = `${a.title?.[locale] || a.title?.ko || ""} ${
        a.excerpt?.[locale] || ""
      }`.toLowerCase();
      const byKw = kw.length === 0 || text.includes(kw);
      return byCat && byKw;
    });
  }, [all, selected, keyword, locale]);

  const total = filtered.length;
  const pageMax = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pageMax);
  const items = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className='space-y-4'>
      {/* 컨트롤 */}
      <div className='flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-wrap gap-2'>
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((k) => {
            const active = selected.has(k);
            return (
              <button
                key={k}
                type='button'
                onClick={() => {
                  const next = new Set(selected);
                  if (active) next.delete(k);
                  else next.add(k);
                  setSelected(next);
                  setPage(1);
                }}
                className={`rounded-full border px-3 py-1 text-xs md:text-sm ${
                  active ? "bg-black text-white" : "bg-white"
                }`}
              >
                {k.toUpperCase()}
              </button>
            );
          })}
        </div>

        <div className='flex items-center gap-2'>
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            placeholder='검색어'
            className='h-9 w-56 rounded-md border px-3 text-sm'
          />
        </div>
      </div>

      {/* 리스트 */}
      {loading ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='h-40 animate-pulse rounded-md border bg-gray-50'
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className='rounded-md border p-6 text-center text-sm text-muted-foreground'>
          표시할 아티클이 없습니다.
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {items.map((a) => (
            <ArticleCard
              key={a.id}
              article={a}
              locale={locale as "ko" | "ja" | "zh" | "en"}
            />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {pageMax > 1 && (
        <div className='flex items-center justify-center gap-2 py-4'>
          <button
            type='button'
            disabled={current === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className='rounded-md border px-3 py-1 text-sm disabled:opacity-50'
          >
            이전
          </button>
          <span className='text-sm'>
            {current} / {pageMax}
          </span>
          <button
            type='button'
            disabled={current === pageMax}
            onClick={() => setPage((p) => Math.min(pageMax, p + 1))}
            className='rounded-md border px-3 py-1 text-sm disabled:opacity-50'
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
