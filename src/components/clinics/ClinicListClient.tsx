"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import SearchInput from "@/components/common/SearchInput";
import LoadingSpinner from "../common/LoadingSpinner";
import ClinicList from "./ClinicList";
import type { ClinicListItem } from "@/types/clinic";
import { fetchClinics } from "@/services/clinics/fetchClinics";
import Container from "../common/Container";
import { CATEGORY_KEYS, type CategoryKey } from "@/constants/categories";
import { CategoryChips } from "@/components/articles/CategoryChips";

const VALID_CATEGORY_KEYS = new Set<string>(CATEGORY_KEYS);

export default function ClinicListClient() {
  const t = useTranslations("clinic");
  const locale = useLocale();
  const router = useRouter();
  const loc: "ko" | "ja" = locale === "ja" ? "ja" : "ko";

  const searchParams = useSearchParams();

  // URL -> 선택 카테고리 추출
  const selectedCategories = useMemo(() => {
    const values = searchParams
      .getAll("categories")
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);

    if (values.length === 0) return [];

    const unique = new Set<CategoryKey>();
    values.forEach((value) => {
      if (VALID_CATEGORY_KEYS.has(value)) {
        unique.add(value as CategoryKey);
      }
    });

    return Array.from(unique);
  }, [searchParams]);

  const [query, setQuery] = useState("");
  const [clinics, setClinics] = useState<ClinicListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const all = await fetchClinics();
        if (mounted) setClinics(all);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 필터 적용 여부
  const hasFilter = query.trim().length > 0 || selectedCategories.length > 0;

  // 필터링
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const categorySet = new Set(selectedCategories);

    if (normalizedQuery.length === 0 && categorySet.size === 0) {
      return clinics;
    }

    return clinics.filter((clinic) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        (clinic.name?.[loc] ?? "").toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        categorySet.size === 0 ||
        (clinic.categoryKeys ?? []).some((key) => categorySet.has(key));

      return matchesQuery && matchesCategory;
    });
  }, [clinics, loc, query, selectedCategories]);

  // URL 파라미터 갱신 유틸
  const updateCategoriesOnURL = (next: Set<CategoryKey>) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (next.size === 0) {
      params.delete("categories");
    } else {
      params.set("categories", Array.from(next).join(","));
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const resetFilters = () => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete("categories");
    params.delete("q");
    setQuery("");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // 추천(대체) 리스트: 간단히 상위 6개
  const recommended = useMemo(() => clinics.slice(0, 6), [clinics]);

  return (
    <Container>
      <div className='flex flex-col space-y-4'>
        {/* 검색창 */}
        <div className='w-full md:max-w-lg mx-auto mb-4'>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t("clinicList.searchPlaceholder")}
            icon
          />
          <p className='text-sm text-center text-muted-foreground mt-2'>
            {t("clinicList.searchHelper")}
          </p>
        </div>

        {/*  카테고리 칩 (한 줄 / 모바일 가로 스크롤) */}
        <div className='w-full md:max-w-2xl mx-auto rounded-xl bg-background p-4'>
          <CategoryChips
            align='center'
            value={new Set<CategoryKey>(selectedCategories)}
            onChange={(next) => updateCategoriesOnURL(next)}
            onReset={resetFilters}
          />
        </div>

        {/* 결과 개수 */}
        {/* <div className='text-[13px] text-muted-foreground'>
          <span className='font-medium text-foreground'>
            {t("clinicList.resultCount", { count: filtered.length })}
          </span>
        </div> */}

        {/* 바디 영역 */}
        {loading ? (
          <div className='min-h-[40vh] flex flex-col items-center justify-center'>
            <LoadingSpinner />
            <p className='mt-4 text-muted-foreground'>
              {t("clinicList.loading")}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          hasFilter ? (
            <>
              {/* 필터 비어 있음 상태 */}
              <div className='min-h-[24vh] flex flex-col items-center justify-center text-center'>
                <p className='text-base font-semibold'>
                  {t("clinicList.emptyFilteredTitle")}
                </p>
                <p className='mt-2 text-sm text-muted-foreground'>
                  {t("clinicList.emptyFilteredHelper")}
                </p>

                <div className='mt-6'>
                  <button
                    type='button'
                    onClick={resetFilters}
                    className='inline-flex items-center rounded-full border px-4 py-2 text-sm'
                  >
                    {t("clinicList.resetButton")}
                  </button>
                </div>
              </div>

              {/* 대체: 추천 업체 */}
              {recommended.length > 0 ? (
                <section className='mx-auto max-w-6xl px-1 sm:px-2'>
                  <h2 className='text-base font-semibold mb-3 text-center md:text-left'>
                    {t("clinicList.recommendedTitle", { default: "추천 프로그램" })}
                  </h2>
                  <ClinicList clinics={recommended} />
                </section>
              ) : null}
            </>
          ) : (
            <div className='min-h-[40vh] flex flex-col items-center justify-center text-center text-sm text-muted-foreground'>
              {t("clinicList.emptyMessage")}
            </div>
          )
        ) : (
          <ClinicList clinics={filtered} />
        )}
      </div>
    </Container>
  );
}
