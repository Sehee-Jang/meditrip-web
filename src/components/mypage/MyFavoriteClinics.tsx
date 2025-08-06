"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserFavoriteHospitalIds } from "@/services/hospitals/favorites";
import { fetchClinics } from "@/services/hospitals/fetchClinics";
import type { Clinic } from "@/types/clinic";
import FavoriteButton from "../hospitals/FavoriteButton";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import { useLocale, useTranslations } from "next-intl";

export default function MyFavoriteClinics() {
  const t = useTranslations("my-favorite");
  const locale = useLocale();
  const loc: "ko" | "ja" = locale === "ja" ? "ja" : "ko";

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setLoading(true);

      const [allClinics, favoriteIds] = await Promise.all([
        fetchClinics(),
        getUserFavoriteHospitalIds(user.uid),
      ]);

      const filtered = allClinics
        .filter((c) => favoriteIds.includes(c.id))
        .map((c) => ({
          ...c,
          isFavorite: true, // UI 일관성 위해 항상 true
        }));

      setClinics(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div className='min-h-[50vh] flex flex-col items-center justify-center'>
        <LoadingSpinner />
        <p className='mt-4 text-gray-500'>{t("loading")}</p>
      </div>
    );

  if (clinics.length === 0) {
    return <p className='text-center text-gray-500'>{t("empty")}</p>;
  }

  return (
    <section className='mb-12'>
      <h2 className='text-lg font-semibold mb-3'>{t("title")}</h2>
      <div className='space-y-4'>
        {clinics.map((clinic) => (
          <div
            key={clinic.id}
            className='relative rounded-xl border px-4 py-3 bg-white shadow-sm hover:shadow-md transition'
          >
            <Link href={`/hospital/${clinic.id}`} className='block'>
              <div className='flex items-center gap-4'>
                <div className='relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden'>
                  <Image
                    src={clinic.images[0] || "/images/placeholder.png"}
                    alt={clinic.name[loc]}
                    fill
                    className='object-cover'
                  />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-base'>
                    {clinic.name[loc]}
                  </h3>
                  <p className='text-sm text-gray-500 mt-1'>
                    {clinic.address[loc]}
                  </p>
                  <div className='mt-1 text-sm text-gray-600 flex items-center gap-1'>
                    <Star className='w-4 h-4 text-yellow-400' />
                    <span>{clinic.rating.toFixed(1)}</span>
                    <span className='text-gray-400'>
                      ({clinic.reviewCount})
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* 하트 아이콘 우측 상단 */}
            <div className='absolute top-3 right-3'>
              <FavoriteButton
                hospitalId={clinic.id}
                position='inline'
                onToggle={(newStatus) => {
                  if (!newStatus) {
                    setClinics((prev) =>
                      prev.filter((c) => c.id !== clinic.id)
                    );
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
