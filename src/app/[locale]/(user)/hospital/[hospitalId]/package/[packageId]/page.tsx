import React from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import { getTranslations } from "next-intl/server";
import type { ClinicDetail } from "@/types/clinic";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import HospitalActions from "@/components/hospitals/HospitalActions";
import { getClinicById } from "@/services/hospitals/getClinicById";
import { toSupportedLocale } from "@/utils/i18n";
import { pickText } from "@/utils/i18n";

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

  // 병원 상세(서브컬렉션 우선 + 레거시 fallback)
  const clinic: ClinicDetail | null = await getClinicById(hospitalId);
  if (!clinic) return notFound();

  const pkg = clinic.packagesList.find((p) => p.id === packageId);
  if (!pkg) return notFound();

  const loc: Locale = toSupportedLocale(locale);
  const title = pickText(pkg.title, loc);
  const precautions = pickText(pkg.precautions ?? null, loc);

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={title}
        mobileTitle={title}
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
                <Image src={img} alt={title} fill className='object-cover' />
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
                  className='h-full rounded-2xl border border-gray-200 bg-white shadow-sm px-5 py-6 flex flex-col items-center text-center'
                >
                  <div className='text-blue-600  text-sm font-semibold mb-2'>
                    {`Step ${String(i + 1).padStart(2, "0")}`}
                  </div>
                  <p>{step.title[loc]}</p>
                </div>
              ))}
            </div>

            {/* 상세 설명 */}
            <h2 className='text-lg font-semibold mb-4'>{t("detailsTitle")}</h2>

            <ol className='space-y-3'>
              {pkg.treatmentDetails.map((step, i) => {
                const hasImg = Boolean(step.imageUrl);
                return (
                  <li key={i}>
                    <article
                      className='group rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md'
                      aria-label={`Step ${String(i + 1).padStart(2, "0")} - ${
                        step.title[loc]
                      }`}
                    >
                      <div className='grid grid-cols-1 md:grid-cols-[160px,1fr]'>
                        {/* 왼쪽 썸네일 */}
                        {hasImg ? (
                          <div className='relative md:rounded-l-2xl overflow-hidden aspect-[4/3] md:aspect-square'>
                            <Image
                              src={step.imageUrl!}
                              alt={step.title[loc]}
                              fill
                              className='object-fit transition-transform duration-300 group-hover:scale-[1.02]'
                              sizes='(min-width: 768px) 160px, 100vw'
                            />
                          </div>
                        ) : (
                          // 이미지가 없을 때는 공간을 차지하지 않음(모바일/데스크 공통)
                          <div className='hidden md:block md:rounded-l-2xl bg-gray-50' />
                        )}

                        {/* 오른쪽 본문 */}
                        <div className='p-4 md:p-6'>
                          <div className='flex items-center gap-3 mb-2'>
                            <span className='inline-flex items-center rounded-full bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1'>
                              {`Step ${String(i + 1).padStart(2, "0")}`}
                            </span>
                            <h3 className='text-base md:text-lg font-semibold text-gray-900'>
                              {step.title[loc]}
                            </h3>
                          </div>

                          {step.description?.[loc] && (
                            <p className='text-sm md:text-base leading-6 text-gray-700'>
                              {step.description[loc]}
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          </>
        )}

        {/* 주의사항 */}
        {pkg.precautions?.[loc] && (
          <>
            <h2 className='text-lg font-semibold mt-10 mb-2'>
              {t("noteTitle")}
            </h2>
            <div className='bg-gray-50 border rounded-md p-4 text-sm text-gray-600'>
              {precautions}
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
