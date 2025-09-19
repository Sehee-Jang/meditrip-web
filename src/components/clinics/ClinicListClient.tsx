"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import SearchInput from "@/components/common/SearchInput";
import LoadingSpinner from "../common/LoadingSpinner";
import ClinicList from "./ClinicList";
import type { ClinicListItem } from "@/types/clinic";
import { fetchClinics } from "@/services/clinics/fetchClinics";
import Container from "../common/Container";

export default function ClinicListClient() {
  const t = useTranslations("clinic");
  const locale = useLocale();
  const loc: "ko" | "ja" = locale === "ja" ? "ja" : "ko";

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
    if (!query) return clinics;
    const q = query.toLowerCase();
    return clinics.filter((c) =>
      (c.name?.[loc] ?? "").toLowerCase().includes(q)
    );
  }, [clinics, query, loc]);

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
        ) : (
          <ClinicList clinics={filtered} />
        )}
      </div>
    </Container>
  );
}
