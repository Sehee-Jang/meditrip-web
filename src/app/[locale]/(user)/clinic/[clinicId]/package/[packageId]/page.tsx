import React from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import { getTranslations } from "next-intl/server";
import type { ClinicDetail } from "@/types/clinic";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import ClinicActions from "@/components/clinics/ClinicActions";
import { getClinicById } from "@/services/clinics/getClinicById";
import { toSupportedLocale } from "@/utils/i18n";
import { pickText } from "@/utils/i18n";

interface Props {
  params: Promise<{
    locale: string;
    clinicId: string;
    packageId: string;
  }>;
}

export default async function PackageDetailPage({ params }: Props) {
  const { locale, clinicId, packageId } = await params;
  const t = await getTranslations("package-detail");

  // 업체 상세(서브컬렉션 우선 + 레거시 fallback)
  const clinic: ClinicDetail | null = await getClinicById(clinicId);
  if (!clinic) return notFound();

  const pkg = clinic.packagesList?.find((p) => p.id === packageId);
  if (!pkg) return notFound();

  const loc: Locale = toSupportedLocale(locale);
  const title = pickText(pkg.title, loc);
  const precautions = pickText(pkg.precautions ?? null, loc);

  const processSteps =
    pkg.treatmentProcess && pkg.treatmentProcess.length > 0
      ? pkg.treatmentProcess
      : pkg.treatmentDetails?.map(({ title }) => ({ title })) ?? [];
  const detailSteps = pkg.treatmentDetails ?? [];
  const hasProcessSteps = processSteps.length > 0;
  const hasDetailSteps = detailSteps.length > 0;

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
          <div className='flex h-40 w-full items-center justify-center rounded border border-border bg-muted text-muted-foreground'>
            {t("noImage")}
          </div>
        )}

        {/* 진료 프로세스 및 상세정보 */}
        {(hasProcessSteps || hasDetailSteps) && (
          <>
            {hasProcessSteps && (
              <>
                <h2 className='text-lg font-semibold mb-4'>
                  {t("processTitle")}
                </h2>
                <div className='grid grid-cols-3 gap-4 mb-8'>
                  {processSteps.map((step, i) => (
                    <div
                      key={i}
                      className='flex h-full flex-col items-center rounded-2xl border border-border bg-card px-5 py-6 text-center shadow-sm'
                    >
                      <div className='text-info text-sm font-semibold mb-2'>
                        {`Step ${String(i + 1).padStart(2, "0")}`}
                      </div>
                      <p>{step.title[loc]}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {hasDetailSteps && (
              <>
                <h2
                  className={`text-lg font-semibold mb-4 ${
                    hasProcessSteps ? "mt-6" : ""
                  }`}
                >
                  {t("detailsTitle")}
                </h2>

                <ol className='space-y-3'>
                  {detailSteps.map((step, i) => {
                    const hasImg = Boolean(step.imageUrl);
                    const stepTitle = step.title?.[loc];
                    const stepDescription = step.description?.[loc];
                    return (
                      <li key={i}>
                        <article
                          className='group rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md'
                          aria-label={stepTitle ?? undefined}
                        >
                          <div className='grid grid-cols-1 md:grid-cols-[160px,1fr]'>
                            {/* 왼쪽 썸네일 */}
                            {hasImg ? (
                              <div className='relative aspect-[4/3] overflow-hidden md:aspect-square rounded-t-2xl md:rounded-tr-none md:rounded-bl-2xl'>
                                <Image
                                  src={step.imageUrl!}
                                  alt={stepTitle ?? title}
                                  fill
                                  className='object-cover transition-transform duration-300 group-hover:scale-[1.02]'
                                  sizes='(min-width: 768px) 160px, 100vw'
                                />
                              </div>
                            ) : (
                              // 이미지가 없을 때는 공간을 차지하지 않음(모바일/데스크 공통)
                              <div className='hidden bg-muted md:block md:rounded-l-2xl' />
                            )}

                            {/* 오른쪽 본문 */}
                            <div className='p-4 md:p-6 space-y-2'>
                              {stepTitle && (
                                <h3 className='text-base font-semibold text-foreground md:text-lg'>
                                  {stepTitle}
                                </h3>
                              )}
                              {stepDescription && (
                                <p className='text-sm leading-6 text-foreground/80 whitespace-pre-line md:text-base'>
                                  {stepDescription}
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
          </>
        )}

        {/* 주의사항 */}
        {pkg.precautions?.[loc] && (
          <>
            <h2 className='mt-10 mb-2 text-lg font-semibold '>
              {t("noteTitle")}
            </h2>

            <div className='rounded-md border bg-muted p-4 text-sm text-foreground whitespace-pre-line'>
              {precautions}
            </div>
          </>
        )}

        {/* Actions: 예약 & 공유 */}
        <ClinicActions
          locale={locale}
          clinicId={clinicId}
          packageId={packageId}
        />
      </section>
    </main>
  );
}
