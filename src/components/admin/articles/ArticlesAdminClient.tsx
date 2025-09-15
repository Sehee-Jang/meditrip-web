"use client";

import { useEffect, useMemo, useState, useDeferredValue, useId } from "react";
import { useLocale } from "next-intl";
import { listArticles } from "@/services/articles/listArticles";
import type { Article } from "@/types/articles";
import {
  CATEGORIES,
  type CategoryKey,
  type Category,
} from "@/constants/categories";
import { normalizeArticles } from "@/utils/articles";
import ArticleCard from "@/components/articles/ArticleCard";
type Props = {
  initialSelectedCategories: CategoryKey[];
  initialKeyword: string;
};

const PAGE_SIZE = 12;

// 칩 버튼 하나를 깔끔하게 렌더링
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-pressed={active}
      className={[
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs md:text-sm",
        "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
        active
          ? "bg-black text-white border-black"
          : "bg-white text-gray-900 hover:bg-gray-50",
      ].join(" ")}
    >
      {label}
      {active ? (
        <span className='ml-0.5 text-[10px] opacity-80' aria-hidden>
          ●
        </span>
      ) : null}
    </button>
  );
}

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
  const deferredKeyword = useDeferredValue(keyword); // 입력 지연으로 검색 과민 반응 방지
  const [page, setPage] = useState<number>(1);
  const searchId = useId();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await listArticles();
        const rows = normalizeArticles(res);
        if (!alive) return;
        setAll(rows.filter((r) => !r.isHidden));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 카테고리/검색어 필터링
  const filtered = useMemo(() => {
    const cats: Category[] =
      selected.size > 0 ? Array.from(selected).map((k) => CATEGORIES[k]) : [];
    const kw = deferredKeyword.trim().toLowerCase();

    return all.filter((a) => {
      const byCat = cats.length === 0 || cats.includes(a.category);
      const text = `${a.title?.[locale] || a.title?.ko || ""} ${
        a.excerpt?.[locale] || ""
      }`.toLowerCase();
      const byKw = kw.length === 0 || text.includes(kw);
      return byCat && byKw;
    });
  }, [all, selected, deferredKeyword, locale]);

  const total = filtered.length;
  const pageMax = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pageMax);
  const items = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  // 페이지 번호
  const pages = useMemo(() => {
    const span = 5;
    const half = Math.floor(span / 2);
    let start = Math.max(1, current - half);
    const end = Math.min(pageMax, start + span - 1);
    start = Math.max(1, end - span + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [current, pageMax]);

  // 카테고리 레이블은 key를 크게 표기하기보다 소문자·가독형으로
  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  return (
    <div className='space-y-4'>
      {/* 컨트롤 바 */}
      <div
        className={[
          "rounded-2xl border border-gray-200 bg-white",
          "p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3",
          "shadow-sm",
        ].join(" ")}
      >
        {/* 카테고리 칩들 */}
        <div className='flex flex-wrap gap-2'>
          {categoryKeys.map((k) => {
            const active = selected.has(k);
            return (
              <FilterChip
                key={k}
                label={k} // 필요하면 i18n 라벨로 치환
                active={active}
                onClick={() => {
                  const next = new Set(selected);
                  if (active) next.delete(k);
                  else next.add(k);
                  setSelected(next);
                  setPage(1);
                }}
              />
            );
          })}
          {/* 초기화 */}
          {selected.size > 0 || keyword ? (
            <button
              type='button'
              onClick={() => {
                setSelected(new Set());
                setKeyword("");
                setPage(1);
              }}
              className='ml-1 inline-flex items-center rounded-full border px-3 py-1 text-xs md:text-sm text-gray-600 hover:bg-gray-50 transition-colors'
            >
              초기화
            </button>
          ) : null}
        </div>

        {/* 검색 입력 */}
        <div className='flex items-center gap-2'>
          <label htmlFor={searchId} className='sr-only'>
            검색어
          </label>
          <input
            id={searchId}
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            placeholder='검색어를 입력하세요'
            className={[
              "h-10 w-64 md:w-72 rounded-xl border border-gray-200 px-3 text-sm",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
              "placeholder:text-gray-400",
            ].join(" ")}
          />
        </div>
      </div>

      {/* 리스트 */}
      {loading ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'
            >
              <div className='aspect-[16/9] w-full bg-gray-100 animate-pulse' />
              <div className='p-3 space-y-2'>
                <div className='h-4 w-3/4 bg-gray-100 animate-pulse rounded' />
                <div className='h-3 w-5/6 bg-gray-100 animate-pulse rounded' />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className='rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 shadow-sm'>
          조건에 맞는 아티클이 없습니다.
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
        <nav
          className='flex items-center justify-center gap-1 py-4'
          aria-label='페이지네이션'
        >
          <button
            type='button'
            disabled={current === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={[
              "h-9 px-3 rounded-lg border text-sm",
              "disabled:opacity-50 bg-white border-gray-200 hover:bg-gray-50 transition-colors",
            ].join(" ")}
          >
            이전
          </button>

          {pages[0] > 1 ? (
            <>
              <button
                type='button'
                onClick={() => setPage(1)}
                className='h-9 px-3 rounded-lg border bg-white border-gray-200 text-sm hover:bg-gray-50'
              >
                1
              </button>
              <span className='px-1 text-gray-400'>…</span>
            </>
          ) : null}

          {pages.map((p) => {
            const isCurrent = p === current;
            return (
              <button
                key={p}
                type='button'
                aria-current={isCurrent ? "page" : undefined}
                onClick={() => setPage(p)}
                className={[
                  "h-9 px-3 rounded-lg border text-sm transition-colors",
                  isCurrent
                    ? "bg-black border-black text-white"
                    : "bg-white border-gray-200 hover:bg-gray-50",
                ].join(" ")}
              >
                {p}
              </button>
            );
          })}

          {pages[pages.length - 1] < pageMax ? (
            <>
              <span className='px-1 text-gray-400'>…</span>
              <button
                type='button'
                onClick={() => setPage(pageMax)}
                className='h-9 px-3 rounded-lg border bg-white border-gray-200 text-sm hover:bg-gray-50'
              >
                {pageMax}
              </button>
            </>
          ) : null}

          <button
            type='button'
            disabled={current === pageMax}
            onClick={() => setPage((p) => Math.min(pageMax, p + 1))}
            className={[
              "h-9 px-3 rounded-lg border text-sm",
              "disabled:opacity-50 bg-white border-gray-200 hover:bg-gray-50 transition-colors",
            ].join(" ")}
          >
            다음
          </button>
        </nav>
      )}
    </div>
  );
}
