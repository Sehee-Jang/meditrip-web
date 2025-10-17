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
  const locale = useLocale();
  const loc: "ko" | "ja" = locale === "ja" ? "ja" : "ko";

  const EXCLUSIVE_LABEL = t("badges.exclusiveLabel", { default: "단독 입점" });

  return (
    <div className='p-4'>
      {/* items-stretch로 열마다 동일 높이, 카드 h-full로 행 높이에 맞춰 스트레치 */}
      <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'>
        {clinics.map((c) => {
          const isExclusive = c.isExclusive === true;
          const exclusiveLabel = t("badges.exclusiveLabel");
          return (
            <li key={c.id} className='h-full'>
              {/* 카드: 고정(반응형) 높이 + flex column → 푸터가 항상 하단 */}
              <Card className='group h-[320px] sm:h-[340px] lg:h-[360px] flex flex-col rounded-2xl overflow-hidden transition-shadow hover:shadow-lg'>
                <Link href={`/clinic/${c.id}`} className='flex h-full flex-col'>
                  {/* 대표 이미지: 고정 높이/비율로 통일 */}
                  <div className='relative w-full h-44'>
                    <Image
                      src={c.images?.[0] ?? "/images/placeholder.png"}
                      alt={c.name?.[loc] ?? ""}
                      fill
                      className='object-cover'
                      sizes='(max-width: 768px) 100vw, 33vw'
                    />
                    <div className='pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent' />

                    {isExclusive && (
                      <div className='absolute left-2 top-2 z-10'>
                        <ExclusiveBadgeIconOnly label={EXCLUSIVE_LABEL} />
                      </div>
                    )}

                    <FavoriteButton
                      clinicId={c.id}
                      className='absolute right-2 top-2 z-30 rounded-full bg-card/90 p-2 shadow backdrop-blur hover:bg-card'
                    />
                  </div>

                  {/* 본문: flex-1로 남은 공간 채움, 내부는 column */}
                  <CardContent className='p-4 flex-1 flex flex-col'>
                    {/* 상단 정보 블록 */}
                    <div>
                      <div className='flex items-center gap-2'>
                        <h2 className='text-base sm:text-[17px] font-medium text-card-foreground leading-snug line-clamp-2'>
                          {c.name?.[loc]}
                        </h2>
                      </div>
                      <p className='mt-1 text-muted-foreground text-sm leading-snug line-clamp-2'>
                        {c.address?.[loc]}
                      </p>
                    </div>

                    {/* 하단(본문 내부) 메타: 위와 간격 확보 후 고정 높이 느낌 */}
                    <div className='mt-auto pt-3 flex items-center justify-between text-sm text-foreground/80'>
                      <div className='flex items-center'>
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
                      {isExclusive && (
                        <ExclusiveTagChip text={exclusiveLabel} />
                      )}
                    </div>
                  </CardContent>

                  {/* 푸터: 카드 맨 아래 고정 */}
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
