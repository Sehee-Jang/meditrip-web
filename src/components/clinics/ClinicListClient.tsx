"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import SearchInput from "@/components/common/SearchInput";
import LoadingSpinner from "../common/LoadingSpinner";
import ClinicList from "./ClinicList";
import type { ClinicListItem } from "@/types/clinic";
import { fetchClinics } from "@/services/clinics/fetchClinics";
import Container from "../common/Container";
import { CATEGORY_KEYS, type CategoryKey } from "@/constants/categories";
const VALID_CATEGORY_KEYS = new Set<string>(CATEGORY_KEYS);

export default function ClinicListClient() {
  const t = useTranslations("clinic");
  const locale = useLocale();
  const loc: "ko" | "ja" = locale === "ja" ? "ja" : "ko";

  const searchParams = useSearchParams();

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

        {/* 로딩 표시 */}
        {loading ? (
          <div className='min-h-[50vh] flex flex-col items-center justify-center'>
            <LoadingSpinner />
            <p className='mt-4 text-muted-foreground'>
              {t("clinicList.loading")}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className='min-h-[50vh] flex flex-col items-center justify-center text-center text-sm text-muted-foreground'>
            {t("clinicList.emptyMessage")}
          </div>
        ) : (
          <ClinicList clinics={filtered} />
        )}
      </div>
    </Container>
  );
}
