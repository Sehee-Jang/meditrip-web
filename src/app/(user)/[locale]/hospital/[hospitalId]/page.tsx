import React from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { fetchHospitals } from "@/services/hospitals/fetchHospitals";
import HospitalCarousel from "@/components/hospitals/HospitalCarousel";
import HospitalActions from "@/components/hospitals/HospitalActions";

interface Props {
  params: Promise<{
    locale: string;
    hospitalId: string;
  }>;
}

export default async function HospitalDetailPage(props: Props) {
  const { locale, hospitalId } = await props.params;
  // hospital-list.json 파일에서 불러올 네임스페이스
  const t = await getTranslations("hospital-list");

  // 데이터 로드 & 404 처리
  const hospitals = await fetchHospitals();
  const hospital = hospitals.find((h) => h.id === hospitalId);
  if (!hospital) notFound();

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("clinicDetail.intro.title")}
        mobileTitle={t("clinicDetail.intro.title")}
        showBackIcon
        center
      />

      <section className='max-w-4xl mx-auto px-4 py-6 flex flex-col gap-8'>
        {/* 대표 이미지 */}
        <section>
          <HospitalCarousel photos={hospital.photos} />
        </section>

        {/* 기본 정보 */}
        <section className='space-y-2'>
          <h2 className='text-2xl font-semibold'>{t("clinicDetail.name")}</h2>
          <h3 className='text-lg font-medium'>
            {t("clinicDetail.intro.subtitle")}
          </h3>
          <div className='flex items-center text-sm text-gray-600'>
            <span className='font-semibold'>
              {t("clinicDetail.addressLabel")}:
            </span>
            <span className='ml-2'>{t("clinicDetail.address")}</span>
          </div>
        </section>

        {/* Vision · Mission · Description */}
        <section className='space-y-2'>
          <div>
            <h3 className='text-xl font-semibold'>
              {t("clinicDetail.visionLabel")}
            </h3>
            <p className='mt-1 text-gray-700'>{t("clinicDetail.vision")}</p>
          </div>
          <div>
            <h3 className='text-xl font-semibold'>
              {t("clinicDetail.missionLabel")}
            </h3>
            <p className='mt-1 text-gray-700'>{t("clinicDetail.mission")}</p>
          </div>
          <div>
            <p className='text-gray-700'>{t("clinicDetail.description")}</p>
          </div>
        </section>

        {/* 이벤트 섹션 */}
        <section className='space-y-2'>
          <h3 className='text-xl font-semibold'>
            {t("clinicDetail.eventsLabel")}
          </h3>
          <ul className='list-disc list-inside space-y-1 text-gray-700'>
            <li>{t("clinicDetail.event1")}</li>
            <li>{t("clinicDetail.event2")}</li>
          </ul>
        </section>

        {/* 패키지 섹션 */}
        <section className='space-y-4'>
          <h3 className='text-xl font-semibold'>
            {t("clinicDetail.packagesLabel")}
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            {hospital.packages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/${locale}/hospital/${hospitalId}/package/${pkg.id}`}
                className='border rounded-2xl overflow-hidden hover:shadow-lg transition'
              >
                {/* 1. 사진 */}
                <div className='relative w-full h-40'>
                  <Image
                    src={pkg.photos[0] ?? "/images/placeholder.png"}
                    alt={t(`clinicDetail.packages.${pkg.id}.title`)}
                    fill
                    className='object-cover'
                  />
                </div>

                <div className='p-4 space-y-2'>
                  {/* 2. 제목/부제 */}
                  <h4 className='font-medium text-lg'>
                    {t(`clinicDetail.packages.${pkg.id}.title`)}
                  </h4>
                  <p className='text-sm text-gray-500'>
                    {t(`clinicDetail.packages.${pkg.id}.subtitle`)}
                  </p>

                  {/* 3. 가격·시간 */}
                  <div className='mt-2 flex items-center justify-between text-gray-700'>
                    <span>{t(`clinicDetail.packages.${pkg.id}.price`)}</span>
                    <span>{t(`clinicDetail.packages.${pkg.id}.duration`)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Actions: 예약 & 공유 */}
        <HospitalActions locale={locale} hospitalId={hospitalId} />
      </section>
    </main>
  );
}
