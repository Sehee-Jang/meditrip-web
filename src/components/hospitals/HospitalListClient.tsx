"use client";

import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import SearchInput from "@/components/common/SearchInput";
import { HospitalCategoryKey } from "@/components/common/CategoryFilter";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserFavoriteHospitalIds } from "@/services/hospitals/favorites";
import LoadingSpinner from "../common/LoadingSpinner";
import ClinicList from "./ClinicList";
import type { Clinic } from "@/types/clinic";
import { fetchClinics } from "@/services/hospitals/fetchClinics";

export default function HospitalListClient() {
  const t = useTranslations("hospital-list");
  const locale = useLocale();
  const loc: "ko" | "ja" = locale === "ja" ? "ja" : "ko";

  const [query, setQuery] = useState("");
  // const [category, setCategory] = useState<HospitalCategoryKey | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const allClinics = await fetchClinics();
      let filtered = [...allClinics];

      // 검색어 필터링
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter((c) =>
          c.name[loc].toLowerCase().includes(q)
        );
      }

      // 카테고리 필터링
      // if (category && category !== "all") {
      //   filtered = filtered.filter((c) => c.category === category);
      // }

      // 찜 여부 추가
      if (user) {
        const favoriteIds = await getUserFavoriteHospitalIds(user.uid);
        filtered = filtered.map((c) => ({
          ...c,
          isFavorite: favoriteIds.includes(c.id),
        }));
      }

      setClinics(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [query, category, loc]);

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
      {/* <CategoryFilter
        categories={["all", "traditional", "cosmetic", "wellness"]}
        selected={category}
        onSelect={(cat) => setCategory(cat as HospitalCategoryKey | null)}
      /> */}

      {/* 로딩 표시 */}
      {loading ? (
        <div className='min-h-[50vh] flex flex-col items-center justify-center'>
          <LoadingSpinner />
          <p className='mt-4 text-gray-500'>{t("clinicList.loading")}</p>
        </div>
      ) : (
        <ClinicList clinics={clinics} />
      )}
      {/* <HospitalList clinics={clinics} /> */}
    </div>
  );
}
