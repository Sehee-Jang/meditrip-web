"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import SearchInput from "@/components/common/SearchInput";
import CategoryFilter, {
  HospitalCategoryKey,
} from "@/components/common/CategoryFilter";
import ClinicList from "./ClinicList";
import { fetchHospitals } from "@/services/hospitals/fetchHospitals";
import type { Hospital } from "@/types/Hospital";

export default function HospitalListClient() {
  const t = useTranslations("hospital-list");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HospitalCategoryKey | null>(null);
  const [clinics, setClinics] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchHospitals()
      .then((data) => {
        // 필터링: 검색어와 카테고리
        let filtered = data;
        if (query) {
          const q = query.toLowerCase();
          filtered = filtered.filter((h) => h.name.toLowerCase().includes(q));
        }
        if (category && category !== "all") {
          filtered = filtered.filter((h) => h.category === category);
        }
        setClinics(filtered);
      })
      .finally(() => setLoading(false));
  }, [query, category]);

  return (
    <div className='flex flex-col space-y-4'>
      {/* 검색창 */}
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={t("clinicList.searchPlaceholder")}
        icon='🔍'
      />

      {/* 카테고리 필터 */}
      <CategoryFilter
        categories={["all", "traditional", "cosmetic", "wellness"]}
        selected={category}
        onSelect={(cat) => setCategory(cat as HospitalCategoryKey | null)}
      />

      {/* 로딩 표시 */}
      {loading && (
        <p className='text-center text-gray-500'>{t("clinicList.loading")}</p>
      )}

      {/* 병원 리스트 */}
      <ClinicList clinics={clinics} />
    </div>
  );
}
