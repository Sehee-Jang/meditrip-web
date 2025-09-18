"use client";
import { useLocale, useTranslations } from "next-intl";
import type { ClinicListItem } from "@/types/clinic";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import FavoriteButton from "./FavoriteButton";
import { ChevronRight, Star } from "lucide-react";

interface ClinicListProps {
  clinics: ClinicListItem[];
}

export default function ClinicList({ clinics }: ClinicListProps) {
  const t = useTranslations("clinic");
  const locale = useLocale(); // 링크 경로용
  const loc: "ko" | "ja" = locale === "ja" ? "ja" : "ko"; // 다국어 텍스트 선택용

  return (
    <div className='p-4'>
      <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {clinics.map((c) => (
          <li key={c.id}>
            <Card className='group hover:shadow-lg transition-shadow rounded-2xl overflow-hidden'>
              <Link href={`/clinic/${c.id}`} className='block'>
                {/* 대표 이미지 */}
                <div className='relative w-full h-40'>
                  <Image
                    src={c.images?.[0] ?? "/images/placeholder.png"}
                    alt={c.name?.[loc] ?? ""}
                    fill
                    className='object-cover'
                    sizes='(max-width: 768px) 100vw, 33vw'
                  />
                  {/* 찜 아이콘 */}
                  <FavoriteButton
                    clinicId={c.id}
                    className='absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white shadow'
                  />
                </div>

                <CardContent className='p-4'>
                  {/* 병원 이름, 주소, 설명 */}
                  <div className='flex flex-col justify-between items-start'>
                    <h2 className='text-lg font-medium text-gray-900'>
                      {c.name?.[loc]}
                    </h2>
                    <p className='text-gray-500'>{c.address?.[loc]}</p>
                  </div>

                  {/* 리뷰 및 별점 */}
                  <div className='mt-3 flex items-center text-sm text-gray-700'>
                    <Star className='w-4 h-4 text-yellow-500' />
                    <span className='ml-1 font-medium'>
                      {typeof c.rating === "number" ? c.rating.toFixed(1) : "-"}
                    </span>
                    <span className='ml-2 text-gray-400'>
                      ({c.reviewCount ?? 0})
                    </span>
                  </div>
                </CardContent>

                <CardFooter className='px-4 py-2 border-t'>
                  <div className='flex items-center justify-between w-full'>
                    <span className='text-sm font-medium text-primary'>
                      {t("clinicList.viewDetails")}
                    </span>
                    <ChevronRight className='w-5 h-5 text-primary' />
                  </div>
                </CardFooter>
              </Link>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
