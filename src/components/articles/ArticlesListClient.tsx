"use client";

import {
  useEffect,
  useMemo,
  useState,
  useDeferredValue,
  useId,
  useRef,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { listArticles } from "@/services/articles/listArticles";
import type { Article } from "@/types/articles";
import { CATEGORIES, CategoryKey, type Category } from "@/constants/categories";
import { normalizeArticles } from "@/utils/articles";
import ArticleDetailClient from "./ArticleDetailClient";

type Props = {
  initialSelectedCategories: CategoryKey[];
  initialKeyword: string;
};

const PAGE_SIZE = 5;

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
  const tCat = useTranslations("categories");
  const locale = useLocale() as keyof Article["title"];
  const [all, setAll] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<Set<CategoryKey>>(
    new Set(initialSelectedCategories)
  );
  const [keyword, setKeyword] = useState<string>(initialKeyword);
  const deferredKeyword = useDeferredValue(keyword);
  const [page, setPage] = useState<number>(1);
  const [selectedId, setSelectedId] = useState<string | null>(null); // 하단 인라인 상세용
  const searchId = useId();

  // 하단 상세 위치로 스크롤하기 위한 ref
  const detailRef = useRef<HTMLDivElement | null>(null);

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

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  return (
    <div className='space-y-6'>
      {/* 컨트롤 바 */}
      <div className=' bg-white p-4 shadow-sm'>
        <div className='flex flex-wrap items-center gap-2'>
          {categoryKeys.map((k) => {
            const active = selected.has(k);
            return (
              <button
                key={k}
                type='button'
                aria-pressed={active}
                onClick={() => {
                  const next = new Set(selected);
                  active ? next.delete(k) : next.add(k);
                  setSelected(next);
                  setPage(1);
                  setSelectedId(null);
                }}
                className={[
                  "rounded-full border px-3 py-1 text-xs md:text-sm transition-colors",
                  active
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white hover:bg-gray-50",
                ].join(" ")}
              >
                {tCat(k)}
              </button>
            );
          })}

          {(selected.size > 0 || keyword) && (
            <button
              type='button'
              onClick={() => {
                setSelected(new Set());
                setKeyword("");
                setPage(1);
                setSelectedId(null);
              }}
              className='ml-1 rounded-full border px-3 py-1 text-xs md:text-sm text-gray-600 hover:bg-gray-50'
            >
              초기화
            </button>
          )}

          {/* 검색 */}
          <div className='ml-auto flex items-center gap-2'>
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
              className='h-10 w-64 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 placeholder:text-gray-400'
            />
          </div>
        </div>
      </div>

      {/* 목록형 리스트 */}
      {loading ? (
        <div className='space-y-2'>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className='h-12 animate-pulse rounded-lg border bg-gray-50'
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className='rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 shadow-sm'>
          조건에 맞는 아티클이 없습니다.
        </div>
      ) : (
        <div className='rounded-xl border border-gray-200 bg-white overflow-hidden'>
          <div className='flex items-center px-4 py-2 text-xs text-gray-500 border-b'>
            <div className='w-12 text-center'>No.</div>
            <div className='flex-1 text-center'>글 제목</div>
            <div className='w-20 text-right'>조회수</div>
            <div className='w-28 text-right'>작성일</div>
          </div>
          <ul role='list' className='divide-y'>
            {items.map((a, i) => {
              const no = items.length - i;
              const title = a.title?.[locale] || a.title?.ko || "제목 없음";
              const views = (a as { views?: number })?.views ?? 0;
              const createdAtRaw = (a as { createdAt?: string | number | Date })
                ?.createdAt;
              const createdAt = createdAtRaw ? new Date(createdAtRaw) : null;
              const selectedState = selectedId === a.id;

              return (
                <li key={a.id}>
                  <button
                    type='button'
                    onClick={() => {
                      setSelectedId((prev) => (prev === a.id ? prev : a.id));
                      setTimeout(
                        () =>
                          detailRef.current?.scrollIntoView({
                            behavior: "smooth",
                          }),
                        0
                      );
                    }}
                    className={[
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                      "hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
                      selectedState ? "bg-gray-50" : "",
                    ].join(" ")}
                    aria-expanded={selectedState}
                  >
                    <span className='w-12 text-center text-xs text-gray-500'>
                      {no}
                    </span>
                    <div className='flex-1 min-w-0 truncate text-sm md:text-base text-gray-900 hover:underline'>
                      {title}
                    </div>
                    <span className='w-20 text-right text-xs text-gray-500 whitespace-nowrap'>
                      {views.toLocaleString()}
                    </span>
                    <div className='w-28 text-right text-xs text-gray-500 whitespace-nowrap'>
                      {createdAt ? createdAt.toLocaleDateString() : ""}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 페이지네이션 - 블로그 느낌의 작은 pill 버튼 */}
      {pageMax > 1 && (
        <nav
          aria-label='페이지네이션'
          className='flex items-center justify-center gap-2 py-2'
        >
          <button
            type='button'
            disabled={current === 1}
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              setSelectedId(null);
            }}
            className='h-8 px-3 rounded-full border text-sm bg-white border-gray-200 disabled:opacity-50 hover:bg-gray-50'
          >
            이전
          </button>

          {pages.map((p) => {
            const isCurrent = p === current;
            return (
              <button
                key={p}
                type='button'
                aria-current={isCurrent ? "page" : undefined}
                onClick={() => {
                  setPage(p);
                  setSelectedId(null);
                }}
                className={[
                  "h-8 min-w-8 px-3 rounded-full border text-sm",
                  isCurrent
                    ? "bg-black border-black text-white"
                    : "bg-white border-gray-200 hover:bg-gray-50",
                ].join(" ")}
              >
                {p}
              </button>
            );
          })}

          <button
            type='button'
            disabled={current === pageMax}
            onClick={() => {
              setPage((p) => Math.min(pageMax, p + 1));
              setSelectedId(null);
            }}
            className='h-8 px-3 rounded-full border text-sm bg-white border-gray-200 disabled:opacity-50 hover:bg-gray-50'
          >
            다음
          </button>
        </nav>
      )}

      {/* 리스트 “하단 한 곳”에만 본문 인라인 */}
      <div ref={detailRef}>
        {selectedId ? <ArticleDetailClient id={selectedId} /> : null}
      </div>
    </div>
  );
}
