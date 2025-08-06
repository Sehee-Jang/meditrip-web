import React from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import { getTranslations } from "next-intl/server";
import { fetchClinics } from "@/services/hospitals/fetchClinics";
import type { Clinic, Locale } from "@/types/clinic";
import Image from "next/image";
import HospitalActions from "@/components/hospitals/HospitalActions";

interface Props {
  params: Promise<{
    locale: string;
    hospitalId: string;
    packageId: string;
  }>;
}

export default async function PackageDetailPage({ params }: Props) {
  const { locale, hospitalId, packageId } = await params;
  const t = await getTranslations("package-detail");

  const clinics: Clinic[] = await fetchClinics();
  const clinic = clinics.find((c) => c.id === hospitalId);
  if (!clinic) return notFound();

  const pkg = clinic.packages[packageId];
  if (!pkg) return notFound();

  const loc = locale as Locale;

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={pkg.title[loc]}
        mobileTitle={pkg.title[loc]}
        showBackIcon
        center
      />

      <section className='max-w-4xl mx-auto space-y-8 px-4 mb-8'>
        {/* 이미지 슬라이더 or 썸네일 */}
        {/* <HospitalCarousel photos={pkg.packageImages} /> */}
        {pkg.packageImages?.length ? (
          <div className='w-full h-60 sm:h-80 md:h-[360px] rounded overflow-hidden'>
            {pkg.packageImages.map((img, i) => (
              <div
                key={i}
                className='relative w-full h-60 sm:h-80 md:h-[360px]'
              >
                <Image
                  src={img}
                  alt={pkg.title[loc]}
                  fill
                  className='object-cover'
                />
              </div>
            ))}
          </div>
        ) : (
          <div className='w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400'>
            {t("noImage")}
          </div>
        )}

        {/* 진료 프로세스 */}
        {pkg.treatmentDetails && pkg.treatmentDetails.length > 0 && (
          <>
            <h2 className='text-lg font-semibold mb-4'>{t("processTitle")}</h2>
            <div className='grid grid-cols-3 gap-4 mb-8'>
              {pkg.treatmentDetails.map((step, i) => (
                <div
                  key={i}
                  className='flex flex-col items-center text-center text-sm text-gray-700'
                >
                  <div className='w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-1'>
                    {`Step ${String(i + 1).padStart(2, "0")}`}
                  </div>
                  <p>{step.title[loc]}</p>
                </div>
              ))}
            </div>

            {/* 상세 설명 */}
            <h2 className='text-lg font-semibold mb-4'>{t("detailsTitle")}</h2>
            <div className='space-y-6'>
              {pkg.treatmentDetails.map((step, i) => (
                <div
                  key={i}
                  className='p-4 border rounded-xl space-y-2 shadow-sm bg-white'
                >
                  {step.imageUrl && (
                    <div className='relative w-full h-48 rounded-md overflow-hidden'>
                      <Image
                        src={step.imageUrl}
                        alt={step.title[loc]}
                        fill
                        className='object-cover'
                      />
                    </div>
                  )}
                  <h3 className='font-semibold text-blue-600'>
                    {`Step ${String(i + 1).padStart(2, "0")} - ${
                      step.title[loc]
                    }`}
                  </h3>
                  <p className='text-gray-700'>{step.description[loc]}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 주의사항 */}
        {pkg.precautions?.[loc] && (
          <>
            <h2 className='text-lg font-semibold mt-10 mb-2'>
              {t("noteTitle")}
            </h2>
            <div className='bg-gray-50 border rounded-md p-4 text-sm text-gray-600'>
              {pkg.precautions[loc]}
            </div>
          </>
        )}

        {/* Actions: 예약 & 공유 */}
        <HospitalActions
          locale={locale}
          hospitalId={hospitalId}
          packageId={packageId}
        />
      </section>
    </main>
  );
}
