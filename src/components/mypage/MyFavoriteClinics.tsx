"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchClinics } from "@/services/hospitals/fetchClinics";
import type { Clinic } from "@/types/clinic";
import FavoriteButton from "../hospitals/FavoriteButton";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ChevronRight, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

export default function MyFavoriteClinics() {
  const t = useTranslations("my-favorite");

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const locale = useLocale() as keyof Clinic["name"];

  useEffect(() => {
    fetchClinics().then(setClinics);
  }, []);

  const favorites = useMemo(
    () => clinics.filter((c) => favoriteIds.has(c.id)),
    [clinics, favoriteIds]
  );
  return (
    <section>
      <h2 className='text-base font-semibold mb-3'>{t("title")}</h2>
      {favorites.length === 0 ? (
        <div className='rounded-2xl border bg-white shadow-sm px-5 py-6 text-center text-gray-500'>
          {t("empty")}
        </div>
      ) : (
        <ul className='space-y-3'>
          {favorites.map((c) => (
            <li key={c.id} className='relative'>
              <Link
                href={`/hospital/${c.id}`}
                className='group block rounded-2xl border bg-white shadow-sm p-4 hover:bg-gray-50 transition'
              >
                <div className='flex items-center gap-4'>
                  <div className='relative w-20 h-20 shrink-0 rounded-xl overflow-hidden'>
                    <Image
                      src={c.images?.[0] ?? "/placeholder.jpg"}
                      alt={c.name[locale] ?? ""}
                      fill
                      className='object-cover'
                      sizes='80px'
                    />
                    {/* 오버레이 즐겨찾기 */}
                    <span
                      className='absolute top-1.5 right-1.5 grid place-items-center w-7 h-7 rounded-full bg-white/90 backdrop-blur shadow ring-1 ring-black/5'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <FavoriteButton
                        hospitalId={c.id}
                        className='p-0 [&_svg]:w-4 [&_svg]:h-4'
                        aria-label='toggle favorite'
                      />
                    </span>
                  </div>

                  <div className='min-w-0 flex-1'>
                    <h3 className='font-semibold text-base truncate'>
                      {c.name[locale]}
                    </h3>
                    <p className='text-sm text-gray-500 mt-1 line-clamp-1'>
                      {c.address?.[locale]}
                    </p>
                    <div className='mt-1 text-sm text-gray-600 flex items-center gap-1'>
                      <Star className='w-4 h-4 text-yellow-400' />
                      <span>
                        {typeof c.rating === "number"
                          ? c.rating.toFixed(1)
                          : "-"}
                      </span>
                      <span className='text-gray-400'>
                        ({c.reviewCount ?? 0})
                      </span>
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className='text-gray-300 group-hover:text-gray-400'
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
