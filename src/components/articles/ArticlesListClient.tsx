"use client";

import {
  useEffect,
  useMemo,
  useState,
  useDeferredValue,
  useId,
  useRef,
} from "react";
import { useLocale } from "next-intl";
import type { Article } from "@/types/articles";
import { CATEGORIES, CategoryKey, type Category } from "@/constants/categories";
import ArticleDetailClient from "./ArticleDetailClient";
import { useSearchParams, useRouter } from "next/navigation";
import { useArticles } from "@/hooks/useArticles";
import { sortByCreatedAtDesc } from "@/utils/articles";
import { ArticleTableHeader, ArticleRow } from "./ArticleTable";
import { CategoryChips } from "./CategoryChips";
import PaginationControls from "@/components/common/PaginationControls";

type Props = {
  initialSelectedCategories: CategoryKey[];
  initialKeyword: string;
};

const DESKTOP_PAGE_SIZE = 5;
const MOBILE_PAGE_SIZE = 3;

export default function ArticlesListClient({
  initialSelectedCategories,
  initialKeyword,
}: Props) {
  const locale = useLocale() as keyof Article["title"];
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [selected, setSelected] = useState<Set<CategoryKey>>(
    new Set(initialSelectedCategories)
  );
  const [keyword, setKeyword] = useState<string>(initialKeyword);
  const deferredKeyword = useDeferredValue(keyword);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DESKTOP_PAGE_SIZE);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const searchId = useId();
  const detailRef = useRef<HTMLDivElement | null>(null);

  // 목록 로딩(공통 훅)
  const { data: all = [], isLoading } = useArticles();

  // 반응형 페이지 사이즈
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const apply = () =>
      setPageSize(mq.matches ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // 필터링
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

  // 정렬
  const filteredSorted = useMemo(
    () => sortByCreatedAtDesc(filtered),
    [filtered]
  );

  const total = filteredSorted.length;
  const pageMax = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pageMax);
  const items = filteredSorted.slice(
    (current - 1) * pageSize,
    current * pageSize
  );

  // 초기 선택: URL id 우선 → 없으면 최신 글
  useEffect(() => {
    if (isLoading || selectedId) return;
    if (filteredSorted.length === 0) return;

    const urlId = searchParams.get("id");
    if (urlId) {
      const idx = filteredSorted.findIndex((x) => x.id === urlId);
      if (idx >= 0) {
        const nextPage = Math.floor(idx / pageSize) + 1;
        if (nextPage !== current) setPage(nextPage);
        setSelectedId(urlId);
        return;
      }
    }
    setSelectedId(filteredSorted[0].id);
  }, [isLoading, filteredSorted, selectedId, searchParams, pageSize, current]);

  // 선택 시 URL 동기화(+ 앵커)
  const selectArticle = (id: string) => {
    setSelectedId((prev) => (prev === id ? prev : id));
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("id", id);
    router.replace(`/articles?${params.toString()}#detail`, { scroll: false });
    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  // 페이지 버튼 목록 생성 (1, …, n-1 n n+1, …, last 형태)
  const makePageItems = (cur: number, max: number): Array<number | "…"> => {
    const pages = new Set<number>();
    pages.add(1);
    pages.add(max);
    for (let p = cur - 1; p <= cur + 1; p += 1) {
      if (p >= 1 && p <= max) pages.add(p);
    }
    const sorted = Array.from(pages).sort((a, b) => a - b);

    const out: Array<number | "…"> = [];
    for (let i = 0; i < sorted.length; i += 1) {
      const p = sorted[i];
      if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
      out.push(p);
    }
    return out;
  };

  const pageItems = makePageItems(current, pageMax);

  return (
    <div className='space-y-6'>
      {/* 컨트롤 바 */}
      <div className='bg-white p-4 shadow-sm rounded-xl'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center'>
          {/* 카테고리 칩 */}
          <CategoryChips
            value={selected}
            onChange={(next) => {
              setSelected(next);
              setPage(1);
              setSelectedId(null);
            }}
            onReset={() => {
              setSelected(new Set());
              setKeyword("");
              setPage(1);
              setSelectedId(null);
            }}
          />

          {/* 검색 */}
          <div className='md:ml-auto'>
            <label htmlFor={searchId} className='sr-only'>
              검색어
            </label>
            <input
              id={searchId}
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
                setSelectedId(null);
              }}
              placeholder='검색어를 입력하세요'
              className='h-10 w-full md:w-72 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 placeholder:text-gray-400'
            />
          </div>
        </div>
      </div>

      {/* 리스트 헤더 */}
      <div className='flex items-center justify-between'>
        <div className='text-[13px] text-gray-600'>
          <span className='font-medium text-gray-900'>
            {total.toLocaleString()}
          </span>
          개의 글
        </div>
        <button
          type='button'
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          className='inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 hover:underline underline-offset-4'
        >
          {isOpen ? "목록닫기" : "목록열기"}
        </button>
      </div>

      {!isOpen ? null : (
        <>
          {isLoading ? (
            <div className='mt-2 space-y-2'>
              {Array.from({ length: pageSize }).map((_, i) => (
                <div
                  key={i}
                  className='h-12 animate-pulse rounded-lg border bg-gray-50'
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className='mt-2 rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 shadow-sm'>
              조건에 맞는 아티클이 없습니다.
            </div>
          ) : (
            <>
              <div className='mt-2 rounded-md border border-gray-200 bg-white overflow-hidden'>
                {/* 헤더 */}
                <div className='hidden sm:block'>
                  <ArticleTableHeader />
                </div>

                {/* 목록 */}
                <ul role='list' className='divide-y'>
                  {items.map((a, i) => {
                    const no = total - ((current - 1) * pageSize + i);
                    return (
                      <li key={a.id}>
                        <ArticleRow
                          indexReverse={no}
                          article={a}
                          onClick={() => selectArticle(a.id)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* 페이지네이션 */}
              {pageMax > 1 && (
                <PaginationControls
                  className='pt-2'
                  current={current}
                  totalPages={pageMax}
                  onChange={(p) => {
                    setPage(p);
                    setSelectedId(null);
                  }}
                />
              )}
            </>
          )}
        </>
      )}

      {/* 리스트 하단: 본문 인라인 */}
      <div id='detail' ref={detailRef}>
        {selectedId ? <ArticleDetailClient id={selectedId} /> : null}
      </div>
    </div>
  );
}
