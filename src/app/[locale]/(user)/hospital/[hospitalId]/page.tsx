import React from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getClinicById } from "@/services/hospitals/getClinicById";
import type { ClinicDetail, Locale } from "@/types/clinic";
import FavoriteButton from "@/components/hospitals/FavoriteButton";
import GoogleMapEmbed from "@/components/common/GoogleMapEmbed";
import { formatPrice, formatDuration } from "@/lib/format";

type PageParams = Promise<{ locale: string; hospitalId: string }>;

export const revalidate = 120;

export default async function ClinicDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { locale, hospitalId } = await params;
  const t = await getTranslations("hospital-detail");

  // 단일 문서만 읽기
  const clinic: ClinicDetail | null = await getClinicById(hospitalId);
  if (!clinic) return notFound();

  const loc = locale as Locale;

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={clinic.name[loc]}
        mobileTitle={clinic.name[loc]}
        showBackIcon
        center
      >
        {/* 모바일 전용 하트(헤더 내부) */}
        <div className='md:hidden'>
          <FavoriteButton hospitalId={hospitalId} className='p-1' />
        </div>
      </PageHeader>

      <section className='max-w-4xl mx-auto px-4 py-6 flex flex-col gap-8'>
        {/* 대표 이미지 슬라이더 */}
        <div className='relative w-full h-72 rounded-xl overflow-hidden '>
          <Image
            src={clinic.images[0] || "/images/placeholder.png"}
            alt={clinic.name[loc]}
            fill
            className='object-cover'
          />

          {/* 데스크탑 전용 하트(이미지 우상단 오버레이) */}
          <div className='absolute top-3 right-3 hidden md:block'>
            <FavoriteButton
              hospitalId={clinic.id}
              className='p-2 rounded-full bg-white/90 hover:bg-white shadow'
            />
          </div>
        </div>

        {/* 병원명 및 소개 */}
        <section className='space-y-2'>
          <h1 className='text-2xl font-bold mb-1'>{clinic.name[loc]}</h1>
          <p className='text-gray-500 mb-2'>{clinic.address[loc]}</p>
          <p className='text-lg font-medium mb-4'>
            {clinic.intro.subtitle[loc]}
          </p>
        </section>

        <GoogleMapEmbed
          lat={clinic.geo?.lat}
          lng={clinic.geo?.lng}
          address={clinic.address[loc]} // 좌표 없을 때만 fallback
          locale={loc}
        />

        {/* 상세 설명 */}
        <section className='space-y-2'>
          <h2 className='text-xl font-semibold'>{t("aboutLabel")}</h2>
          <p>{clinic.description[loc]}</p>

          <h2 className='text-xl font-semibold'>{t("visionLabel")}</h2>
          <p>{clinic.vision[loc]}</p>

          <h2 className='text-xl font-semibold'>{t("missionLabel")}</h2>
          <p>{clinic.mission[loc]}</p>
        </section>

        {/* 이벤트 안내 */}
        {clinic.events?.[loc]?.length > 0 && (
          <section className='space-y-2'>
            <h2 className='text-xl font-semibold'>{t("eventsLabel")}</h2>
            <ul className='list-disc list-inside text-gray-700'>
              {clinic.events[loc].map((e: string, i: number) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </section>
        )}

        {/* 패키지 리스트 */}
        <section className='space-y-2'>
          <h2 className='text-xl font-semibold'>{t("packagesLabel")}</h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            {clinic.packagesList.map((pkg) => {
              const pkgId = encodeURIComponent(pkg.id);
              const durationText = formatDuration(loc, pkg.duration[loc]); // ⬅️ 숫자 → 60분/分
              const priceText = formatPrice(loc, pkg.price[loc]); // ⬅️ 숫자 → 10,000원/円

              return (
                <Link
                  key={pkg.id}
                  href={`/${locale}/hospital/${hospitalId}/package/${pkgId}`}
                  className='border rounded-2xl overflow-hidden hover:shadow-lg transition'
                >
                  {/* 1. 패키지 이미지 */}
                  {pkg.packageImages?.map((img, i) => (
                    <div key={i} className='relative w-full h-80'>
                      <Image
                        src={img}
                        alt={pkg.title[loc]}
                        fill
                        className='object-cover'
                      />
                    </div>
                  ))}

                  <div className='p-4 space-y-2'>
                    {/* 2. 제목/부제 */}
                    <h3 className='font-medium text-lg'>{pkg.title[loc]}</h3>
                    <p className='text-sm text-gray-500'>{pkg.subtitle[loc]}</p>

                    {/* 3. 가격·시간 */}
                    <div className='mt-2 flex items-center justify-between text-gray-700'>
                      <span>{durationText}</span>
                      <span>{priceText}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
