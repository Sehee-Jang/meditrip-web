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
import { useRouter, useSearchParams } from "next/navigation";

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
  const tCat = useTranslations("categories");
  const locale = useLocale() as keyof Article["title"];
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [all, setAll] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<Set<CategoryKey>>(
    new Set(initialSelectedCategories)
  );
  const [keyword, setKeyword] = useState<string>(initialKeyword);
  const deferredKeyword = useDeferredValue(keyword);
  const [page, setPage] = useState<number>(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(DESKTOP_PAGE_SIZE);

  const searchId = useId();
  const detailRef = useRef<HTMLDivElement | null>(null);

  // 목록 로드
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

  // 정렬: 최신 우선
  const filteredSorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ad = (a as { createdAt?: string | number | Date })?.createdAt;
      const bd = (b as { createdAt?: string | number | Date })?.createdAt;
      const an = ad ? new Date(ad).getTime() : 0;
      const bn = bd ? new Date(bd).getTime() : 0;
      return bn - an;
    });
  }, [filtered]);

  const total = filteredSorted.length;
  const pageMax = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pageMax);
  const items = filteredSorted.slice(
    (current - 1) * pageSize,
    current * pageSize
  );

  // 초기 선택: URL id 우선 → 없으면 최신 글
  useEffect(() => {
    if (loading || selectedId) return;
    if (filteredSorted.length === 0) return;

    const urlId = searchParams.get("id");
    if (urlId) {
      const idx = filteredSorted.findIndex((x) => x.id === urlId);
      if (idx >= 0) {
        const nextPage = Math.floor(idx / pageSize) + 1;
        if (nextPage !== current) setPage(nextPage);
        setSelectedId(urlId);
        // 앵커는 브라우저가 처리(#detail)
        return;
      }
    }
    setSelectedId(filteredSorted[0].id);
  }, [loading, filteredSorted, selectedId, searchParams, pageSize, current]);

  // 페이지 버튼 목록
  const pages = useMemo(() => {
    const span = 5;
    const half = Math.floor(span / 2);
    let start = Math.max(1, current - half);
    const end = Math.min(pageMax, start + span - 1);
    start = Math.max(1, end - span + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [current, pageMax]);

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  // 선택 시 URL 동기화(+ 앵커)
  const selectArticle = (id: string) => {
    setSelectedId((prev) => (prev === id ? prev : id));
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("id", id);
    router.replace(`/articles?${params.toString()}#detail`, { scroll: false });
    // 브라우저 앵커 스크롤이 동작하지 않을 매우 드문 케이스 대비
    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  return (
    <div className='space-y-6'>
      {/* 컨트롤 바 */}
      <div className='bg-white p-4 shadow-sm rounded-xl'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center'>
          {/* 카테고리 칩 */}
          <div className='-mx-3 px-3 overflow-x-auto md:overflow-visible'>
            <div className='flex gap-2 whitespace-nowrap md:flex-wrap'>
              {categoryKeys.map((k) => {
                const active = selected.has(k);
                return (
                  <button
                    key={k}
                    type='button'
                    aria-pressed={active}
                    onClick={() => {
                      const next = new Set(selected);
                      if (active) next.delete(k);
                      else next.add(k);
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
                  className='rounded-full border px-3 py-1 text-xs md:text-sm text-gray-600 hover:bg-gray-50'
                >
                  초기화
                </button>
              )}
            </div>
          </div>

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

      {/* 목록 헤더 */}
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
          {loading ? (
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
              {/* 테이블 */}
              <div className='mt-2 rounded-md border border-gray-200 bg-white overflow-hidden'>
                <div className='flex sm:hidden items-center border-b px-4 py-2 text-xs text-gray-500'>
                  <div className='w-12 text-center'>No.</div>
                  <div className='flex-1'>글 제목</div>
                </div>
                <div className='hidden sm:flex items-center border-b px-4 py-2 text-xs text-gray-500'>
                  <div className='w-12 text-center'>No.</div>
                  <div className='flex-1'>글 제목</div>
                  <div className='w-20 text-right'>조회수</div>
                  <div className='w-28 text-right'>작성일</div>
                </div>

                <ul role='list' className='divide-y'>
                  {items.map((a, i) => {
                    const no = total - ((current - 1) * pageSize + i);
                    const title =
                      a.title?.[locale] || a.title?.ko || "제목 없음";
                    const views = (a as { views?: number })?.views ?? 0;
                    const createdAtRaw = (
                      a as { createdAt?: string | number | Date }
                    )?.createdAt;
                    const createdAt = createdAtRaw
                      ? new Date(createdAtRaw)
                      : null;
                    const isSelected = selectedId === a.id;

                    return (
                      <li key={a.id}>
                        <button
                          type='button'
                          onClick={() => selectArticle(a.id)}
                          className={[
                            "w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
                            isSelected ? "bg-gray-50" : "",
                          ].join(" ")}
                          aria-expanded={isSelected}
                        >
                          {/* 모바일 */}
                          <div className='flex sm:hidden items-center gap-3'>
                            <div className='w-12 text-center text-xs text-gray-500'>
                              {no}
                            </div>
                            <div className='flex-1 min-w-0 truncate text-sm text-gray-900'>
                              {title}
                            </div>
                          </div>
                          {/* 데스크탑 */}
                          <div className='hidden sm:flex items-center gap-3'>
                            <div className='w-12 text-center text-xs text-gray-500'>
                              {no}
                            </div>
                            <div className='flex-1 min-w-0 truncate text-sm md:text-base text-gray-900 hover:underline'>
                              {title}
                            </div>
                            <div className='w-20 text-right text-xs text-gray-500 whitespace-nowrap'>
                              {views.toLocaleString()}
                            </div>
                            <div className='w-28 text-right text-xs text-gray-500 whitespace-nowrap'>
                              {createdAt ? createdAt.toLocaleDateString() : ""}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* 페이지네이션 */}
              {pageMax > 1 && (
                <nav
                  aria-label='페이지네이션'
                  className='flex items-center justify-center gap-1 py-3'
                >
                  <button
                    type='button'
                    disabled={current === 1}
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      setSelectedId(null);
                    }}
                    className='h-8 px-3 rounded-full border text-xs bg-white border-gray-200 disabled:opacity-50 hover:bg-gray-50'
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
                          "h-8 min-w-8 px-3 rounded-full border text-xs",
                          isCurrent
                            ? "bg-gray-900 border-gray-900 text-white"
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
                    className='h-8 px-3 rounded-full border text-xs bg-white border-gray-200 disabled:opacity-50 hover:bg-gray-50'
                  >
                    다음
                  </button>
                </nav>
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
