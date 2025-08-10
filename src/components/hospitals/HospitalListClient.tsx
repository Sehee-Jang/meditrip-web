"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import SearchInput from "@/components/common/SearchInput";
import LoadingSpinner from "../common/LoadingSpinner";
import ClinicList from "./ClinicList";
import type { Clinic } from "@/types/clinic";
import { fetchClinics } from "@/services/hospitals/fetchClinics";

export default function HospitalListClient() {
  const t = useTranslations("hospital-list");
  const locale = useLocale();
  const loc: "ko" | "ja" = locale === "ja" ? "ja" : "ko";

  const [query, setQuery] = useState("");
  const [clinics, setClinics] = useState<Clinic[]>([]);
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
    <div className='flex flex-col space-y-4'>
      {/* 검색창 */}
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={t("clinicList.searchPlaceholder")}
        icon='🔍'
      />

      {/* 로딩 표시 */}
      {loading ? (
        <div className='min-h-[50vh] flex flex-col items-center justify-center'>
          <LoadingSpinner />
          <p className='mt-4 text-gray-500'>{t("clinicList.loading")}</p>
        </div>
      ) : (
        <ClinicList clinics={filtered} />
      )}
    </div>
  );
}
