"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchClinics } from "@/services/clinics/fetchClinics";
import type { ClinicListItem } from "@/types/clinic";
import type { LocaleKey } from "@/constants/locales";
import FavoriteButton from "../clinics/FavoriteButton";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ChevronRight, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

export default function MyFavoriteClinics() {
  const t = useTranslations("my-favorite");

  const [clinics, setClinics] = useState<ClinicListItem[]>([]);
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const locale = useLocale() as LocaleKey;

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
        <div className='rounded-2xl border border-border bg-card px-5 py-6 text-center text-sm text-muted-foreground shadow-sm'>
          {t("empty")}
        </div>
      ) : (
        <ul className='space-y-3'>
          {favorites.map((c) => (
            <li key={c.id} className='relative'>
              <Link
                href={`/clinic/${c.id}`}
                className='group block rounded-2xl border bg-card shadow-sm p-4 hover:bg-accent transition'
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
                      className='absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-card/90 backdrop-blur shadow ring-1 ring-border'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <FavoriteButton
                        clinicId={c.id}
                        className='p-0 [&_svg]:w-4 [&_svg]:h-4'
                        aria-label='toggle favorite'
                      />
                    </span>
                  </div>

                  <div className='min-w-0 flex-1'>
                    <h3 className='truncate text-base font-semibold text-foreground'>
                      {c.name[locale]}
                    </h3>
                    <p className='mt-1 line-clamp-1 text-sm text-muted-foreground'>
                      {c.address?.[locale]}
                    </p>
                    <div className='mt-1 flex items-center gap-1 text-sm text-muted-foreground'>
                      <Star className='h-4 w-4 text-yellow-500 dark:text-yellow-400' />
                      <span>
                        {typeof c.rating === "number"
                          ? c.rating.toFixed(1)
                          : "-"}
                      </span>
                      <span>({c.reviewCount ?? 0})</span>
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className='text-muted-foreground transition-colors group-hover:text-foreground/80'
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
