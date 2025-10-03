"use client";
import { useLocale, useTranslations } from "next-intl";
import type { ClinicListItem } from "@/types/clinic";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import FavoriteButton from "./FavoriteButton";
import { ChevronRight, Crown, Star } from "lucide-react";

interface ClinicListProps {
  clinics: ClinicListItem[];
}

/* 이미지 위 배지: 아이콘만(원형) */
function ExclusiveBadgeIconOnly({ label }: { label: string }) {
  return (
    <span
      className='inline-flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md ring-white/70 backdrop-blur
      bg-gradient-to-br from-amber-500 to-rose-500'
      aria-label={label}
      title={label}
    >
      <Crown className='h-3.5 w-3.5' aria-hidden />
    </span>
  );
}

/* 본문 태그: 아이콘 + 텍스트 (작은 필 칩) */
function ExclusiveTagChip({ text }: { text: string }) {
  return (
    <span
      className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5
                 text-[11px] font-medium text-white shadow-sm
                 bg-gradient-to-r from-amber-500 to-rose-500
                 ring-1 ring-white/10'
    >
      <Crown className='h-3 w-3' aria-hidden />
      {text}
    </span>
  );
}

export default function ClinicList({ clinics }: ClinicListProps) {
  const t = useTranslations("clinic");
  const locale = useLocale(); // 링크 경로용
  const loc: "ko" | "ja" = locale === "ja" ? "ja" : "ko"; // 다국어 텍스트 선택용

  const EXCLUSIVE_LABEL = t("badges.exclusiveLabel", { default: "단독 입점" });

  return (
    <div className='p-4'>
      <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {clinics.map((c) => {
          const isExclusive = c.isExclusive === true;
          const exclusiveLabel = t("badges.exclusiveLabel");
          return (
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

                    {/* 상단 그라데이션(배지 가독성 보조) */}
                    <div className='pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent' />

                    {/* 단독 입점 배지: 북마크 */}
                    {isExclusive && (
                      <div className='absolute left-2 top-2 z-10'>
                        <ExclusiveBadgeIconOnly label={EXCLUSIVE_LABEL} />
                      </div>
                    )}

                    {/* 찜 아이콘(배지보다 위에 올리고 싶으면 z-30) */}
                    <FavoriteButton
                      clinicId={c.id}
                      className='absolute right-2 top-2 z-30 rounded-full bg-card/90 p-2 shadow backdrop-blur hover:bg-card'
                    />
                  </div>

                  <CardContent className='p-4'>
                    {/* 병원 이름, 주소, 설명 */}
                    <div className='flex flex-col justify-between items-start'>
                      <div className='flex flex-row items-center space-around gap-2'>
                        {/* 병원명 */}
                        <h2 className='text-lg font-medium text-card-foreground'>
                          {c.name?.[loc]}
                        </h2>
                      </div>

                      {/* 주소 */}
                      <p className='text-muted-foreground'>
                        {c.address?.[loc]}
                      </p>
                    </div>

                    {/* 리뷰 및 별점 */}
                    <div className='mt-3 flex flex-row items-center justify-between text-sm text-foreground/80'>
                      <div className='flex'>
                        <Star className='h-4 w-4 text-yellow-500 dark:text-yellow-400' />
                        <span className='ml-1 font-medium'>
                          {typeof c.rating === "number"
                            ? c.rating.toFixed(1)
                            : "-"}
                        </span>
                        <span className='ml-2 text-muted-foreground'>
                          ({c.reviewCount ?? 0})
                        </span>
                      </div>

                      {/* 하단 태그(필 칩) */}
                      {isExclusive && (
                        <ExclusiveTagChip text={exclusiveLabel} />
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className='px-4 py-2 border-t'>
                    <div className='flex items-center justify-between w-full'>
                      <span className='text-sm font-medium text-primary group-hover:underline'>
                        {t("clinicList.viewDetails")}
                      </span>
                      <ChevronRight className='w-5 h-5 text-primary' />
                    </div>
                  </CardFooter>
                </Link>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
