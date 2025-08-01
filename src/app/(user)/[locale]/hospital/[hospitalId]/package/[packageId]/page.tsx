// src/app/(user)/[locale]/hospital/[hospitalId]/package/[packageId]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import HospitalCarousel from "@/components/hospitals/HospitalCarousel";
import PackageReserveButton from "@/components/hospitals/PackageReserveButton";
import { getTranslations } from "next-intl/server";
import { fetchHospitals } from "@/services/hospitals/fetchHospitals";
import type { Hospital } from "@/types/Hospital";

interface Props {
  params: {
    locale: string;
    hospitalId: string;
    packageId: string;
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const { locale, hospitalId, packageId } = params;
  const t = await getTranslations("package-detail");

  // mockHospitals 기반 데이터 로드
  const hospitals: Hospital[] = await fetchHospitals();
  const hospital = hospitals.find((h) => h.id === hospitalId);
  if (!hospital) return notFound();

  const pkg = hospital.packages.find((p) => p.id === packageId);
  if (!pkg) return notFound();

  return (
    <main className='md:px-4 md:py-8'>
      {/* 1) 패키지 이름으로 헤더 제목 설정 */}
      <PageHeader
        desktopTitle={pkg.title}
        mobileTitle={pkg.title}
        showBackIcon
        center
      />

      <section className='max-w-4xl mx-auto space-y-8 px-4'>
        {/* 이미지 슬라이더 */}
        <HospitalCarousel photos={pkg.photos} />

        {/* 진료 프로세스 */}
        {pkg.process && (
          <div className='space-y-2'>
            <h3 className='text-xl font-semibold'>{t("process.title")}</h3>
            <div className='grid grid-cols-3 sm:grid-cols-6 gap-4 mt-4'>
              {pkg.process.map((step, idx) => (
                <div key={idx} className='flex flex-col items-center'>
                  <div className='w-12 h-12 rounded-lg border flex items-center justify-center'>
                    {step.icon}
                  </div>
                  <span className='mt-2 text-sm text-center'>{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 진료 상세 정보 */}
        {pkg.details && (
          <div className='space-y-2'>
            <h3 className='text-xl font-semibold'>{t("details.title")}</h3>
            <div className='space-y-6 mt-4'>
              {pkg.details.map((d, idx) => (
                <div key={idx} className='flex gap-4'>
                  <div className='w-24 h-24 rounded-lg overflow-hidden'>
                    <img
                      src={d.image}
                      alt={d.title}
                      className='object-cover w-full h-full'
                    />
                  </div>
                  <div className='flex-1 space-y-1'>
                    <div className='text-sm font-medium text-blue-500'>
                      {t("details.stepTitle", { step: idx + 1 })}
                    </div>
                    <h4 className='font-semibold'>{d.title}</h4>
                    <p className='text-gray-700 text-sm'>{d.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 주의 사항 */}
        {pkg.cautions && (
          <div className='border rounded-lg p-4'>
            <h4 className='font-semibold'>{t("cautions.title")}</h4>
            <p className='mt-2 text-gray-700 text-sm'>{pkg.cautions}</p>
          </div>
        )}

        {/* 예약하기 버튼 */}
        <div className='text-center'>
          <PackageReserveButton
            locale={locale}
            hospitalId={hospitalId}
            packageId={packageId}
          />
        </div>
      </section>
    </main>
  );
}
