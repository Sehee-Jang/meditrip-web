"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import SearchInput from "@/components/common/SearchInput";
import CategoryFilter, {
  HospitalCategoryKey,
} from "@/components/common/CategoryFilter";
import HospitalList from "./HospitalList";
import { fetchHospitals } from "@/services/hospitals/fetchHospitals";
import type { Hospital } from "@/types/hospital";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserFavoriteHospitalIds } from "@/services/hospitals/favorites";

export default function HospitalListClient() {
  const t = useTranslations("hospital-list");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HospitalCategoryKey | null>(null);
  const [clinics, setClinics] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      let uid: string | null = null;
      if (user) {
        uid = user.uid;
      }

      const allHospitals = await fetchHospitals();

      // 필터링: 검색어와 카테고리
      let filtered = allHospitals;
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter((h) => h.name.toLowerCase().includes(q));
      }
      if (category && category !== "all") {
        filtered = filtered.filter((h) => h.category === category);
      }

      // 로그인 상태일 경우 찜 여부 불러오기
      if (uid) {
        const favoriteIds = await getUserFavoriteHospitalIds(uid);
        filtered = filtered.map((h) => ({
          ...h,
          isFavorite: favoriteIds.includes(h.id),
        }));
      }

      setClinics(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
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
      <HospitalList clinics={clinics} />
    </div>
  );
}
