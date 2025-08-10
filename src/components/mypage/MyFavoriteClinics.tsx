"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchClinics } from "@/services/hospitals/fetchClinics";
import type { Clinic } from "@/types/clinic";
import FavoriteButton from "../hospitals/FavoriteButton";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
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
    <section className='mb-12'>
      <h2 className='text-lg font-semibold mb-3'>{t("title")}</h2>
      {favorites.length === 0 ? (
        <div className='relative rounded-xl border px-4 py-3 bg-white shadow-sm '>
          <p className='text-center text-gray-500'>{t("empty")}</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {favorites.map((c) => (
            <div
              key={c.id}
              className='relative rounded-xl border px-4 py-3 bg-white shadow-sm hover:shadow-md transition'
            >
              <Link href={`/${locale}/hospital/${c.id}`}>
                <div className='flex items-center gap-4'>
                  <div className='relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden'>
                    <Image
                      src={c.images?.[0] ?? "/placeholder.jpg"}
                      alt={c.name[locale] ?? ""}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-base'>
                      {c.name[locale]}
                    </h3>
                    <p className='text-sm text-gray-500 mt-1'>
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
                </div>
              </Link>

              {/* 하트 아이콘 우측 상단 */}
              <div className='absolute top-3 right-3'>
                <FavoriteButton hospitalId={c.id} className='p-1' />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// // src/components/mypage/MyFavoriteClinics.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { fetchClinics } from "@/services/hospitals/fetchClinics";
// import type { Clinic } from "@/types/clinic";
// import { useFavoritesStore } from "@/stores/useFavoritesStore";
// import Link from "next/link";
// import Image from "next/image";
// import { useLocale } from "next-intl";
// import FavoriteButton from "@/components/hospitals/FavoriteButton";

// export default function MyFavoriteClinics() {
//   const [clinics, setClinics] = useState<Clinic[]>([]);
//   const favoriteIds = useFavoritesStore((s) => s.ids); // Set<string>
//   const locale = useLocale() as keyof Clinic["name"];

//   useEffect(() => {
//     fetchClinics().then(setClinics);
//   }, []);

//   const favorites = useMemo(
//     () => clinics.filter((c) => favoriteIds.has(c.id)),
//     [clinics, favoriteIds]
//   );

//   if (favorites.length === 0) {
//     return (
//       <div className='p-4 text-sm text-muted-foreground'>
//         찜한 병원이 없습니다.
//       </div>
//     );
//   }

//   return (
//     <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4'>
//       {favorites.map((c) => (
//         <li key={c.id}>
//           <Link href={`/${locale}/hospital/${c.id}`}>
//             <div className='relative border rounded-lg overflow-hidden'>
//               <Image
//                 src={c.images?.[0] ?? "/placeholder.jpg"}
//                 alt={c.name[locale] ?? ""}
//                 width={800}
//                 height={600}
//                 className='aspect-[4/3] object-cover w-full'
//               />
//               <div className='p-3 flex items-center justify-between'>
//                 <div>
//                   <div className='font-semibold'>{c.name[locale]}</div>
//                   <div className='text-sm text-muted-foreground'>
//                     {c.address?.[locale]}
//                   </div>
//                 </div>
//                 <FavoriteButton hospitalId={c.id} className='p-1' />
//               </div>
//             </div>
//           </Link>
//         </li>
//       ))}
//     </ul>
//   );
// }
