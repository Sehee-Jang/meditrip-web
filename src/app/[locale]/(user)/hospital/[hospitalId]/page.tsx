import React from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getClinicById } from "@/services/hospitals/getClinicById";
import type { ClinicDetail, DayOfWeek } from "@/types/clinic";
import type { Locale } from "@/i18n/routing";
import FavoriteButton from "@/components/hospitals/FavoriteButton";
import GoogleMapEmbed from "@/components/common/GoogleMapEmbed";
import { formatPrice, formatDuration } from "@/lib/format";
import { toSupportedLocale, pickText, pickLocalized } from "@/utils/i18n";
import { Clock, Earth, MapPin, Phone, Star, ChevronDown } from "lucide-react";

type PageParams = Promise<{ locale: string; hospitalId: string }>;
type SearchParams = Promise<{ tab?: string }>;

export const revalidate = 120;

/** 오늘 지금 시각 기준 영업중 판단 */
function isOpenNow(
  weeklyHours: ClinicDetail["weeklyHours"] | undefined
): boolean | null {
  if (!weeklyHours) return null;
  const now = new Date();
  const dayKeys: DayOfWeek[] = [
    "sun",
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
  ];
  const d = dayKeys[now.getDay()];
  const ranges = weeklyHours[d] ?? [];
  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  const cur = `${hh}:${mm}`;
  return ranges.some((r) => r.open <= cur && cur <= r.close);
}

/** 별점 표시 (정수 5개 아이콘) */
function StarRow({ score }: { score: number }) {
  const s = Math.max(0, Math.min(5, Math.round(score)));
  return (
    <div className='inline-flex items-center gap-0.5 align-middle'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < s ? "fill-current text-amber-500" : "text-muted-foreground"
          }
        />
      ))}
    </div>
  );
}

/** 아이콘 + 텍스트 한 줄 */
function InfoRow({
  icon,
  children,
  right,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className='flex items-center gap-3 px-4 py-4 text-[15px]'>
      <span className='mt-0.5 shrink-0 text-muted-foreground'>{icon}</span>
      <div className='flex-1'>{children}</div>
      {right ? <div className='ml-3 shrink-0'>{right}</div> : null}
    </div>
  );
}

export default async function ClinicDetailPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: SearchParams;
}) {
  const { locale, hospitalId } = await params;
  const { tab } = await searchParams;
  const activeTab: "info" | "reviews" = tab === "reviews" ? "reviews" : "info";

  const t = await getTranslations("hospital-detail");

  // 단일 문서만 읽기
  const clinic: ClinicDetail | null = await getClinicById(hospitalId);
  if (!clinic) return notFound();

  const loc: Locale = toSupportedLocale(locale);

  const name = pickText(clinic.name, loc);
  const address = pickText(clinic.address, loc);
  const description = pickText(clinic.description, loc);
  const vision = pickText(clinic.vision, loc);
  const mission = pickText(clinic.mission, loc);
  const hoursNote = pickText(clinic.hoursNote ?? null, loc);
  const events = pickLocalized<string[]>(clinic.events ?? null, loc) ?? [];
  const open = isOpenNow(clinic.weeklyHours);

  // ClinicDetailPage 내부, 값 계산 직후에 추가 (도메인/소셜 안전 처리)
  const websiteHost = clinic.website ? new URL(clinic.website).hostname : null;
  const socials = (clinic.socials ?? {}) as Partial<
    Record<"instagram" | "line" | "youtube" | "whatsapp", string>
  >;

  // 선택적 속성들(존재할 때만 노출)
  const tags: string[] =
    "tags" in clinic && Array.isArray((clinic as { tags?: string[] }).tags)
      ? ((clinic as { tags?: string[] }).tags as string[])
      : [];

  const rating =
    "rating" in clinic
      ? (clinic as { rating?: { avg?: number; count?: number } }).rating
      : undefined;
  const ratingAvg = typeof rating?.avg === "number" ? rating?.avg : undefined;
  const ratingCount =
    typeof rating?.count === "number" ? rating?.count : undefined;

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader desktopTitle={name} mobileTitle={name} showBackIcon center>
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
            alt={name || "clinic image"}
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
        {/* 타이틀 + 위치 + 별점 + 태그칩 */}
        <div className='px-4 pt-4'>
          <h1 className='text-2xl font-semibold'>{name}</h1>
          <div className='mt-1 flex items-center gap-2 text-sm text-muted-foreground'>
            <MapPin size={16} />
            <span className='truncate'>{address}</span>
          </div>

          {/* 별점 */}
          {typeof ratingAvg === "number" && (
            <div className='mt-1 flex items-center gap-1 text-sm'>
              <StarRow score={ratingAvg} />
              <span className='ml-1'>{ratingAvg.toFixed(1)}</span>
              {typeof ratingCount === "number" && (
                <span className='text-muted-foreground'>({ratingCount})</span>
              )}
            </div>
          )}

          {/* 태그 칩 */}
          {tags.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-2'>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className='inline-flex rounded-md border px-2.5 py-1 text-xs bg-background'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* 탭 네비게이션 (비JS, 앵커/링크) */}
        <div className='mt-2'>
          <div className='border-b'>
            <nav className='grid grid-cols-2 text-sm'>
              <Link
                href={`/${locale}/hospital/${hospitalId}?tab=info`}
                className={`block text-center no-underline py-3 border-b-2 ${
                  activeTab === "info"
                    ? "text-[#EB7F65] border-[#EB7F65] font-medium"
                    : "text-muted-foreground border-transparent"
                }`}
                aria-current={activeTab === "info" ? "page" : undefined}
              >
                {t("infoTab")}
              </Link>
              <Link
                href={`/${locale}/hospital/${hospitalId}?tab=reviews`}
                className={`block text-center no-underline py-3 border-b-2 ${
                  activeTab === "reviews"
                    ? "text-[#EB7F65] border-[#EB7F65] font-medium"
                    : "text-muted-foreground border-transparent"
                }`}
                aria-current={activeTab === "reviews" ? "page" : undefined}
              >
                {t("reviewsTab")}
              </Link>
            </nav>
          </div>
          {/* 탭 컨텐츠: info / reviews */}
          <div>
            {activeTab === "info" ? (
              <section className='mt-2 bg-white border-b divide-y'>
                {/* 주소 */}
                <InfoRow icon={<MapPin size={18} />}>
                  <div className='leading-relaxed'>{address}</div>
                </InfoRow>

                {/* 영업시간: 좌측 상태, 우측 안내 + ▾ */}
                <InfoRow
                  icon={<Clock size={18} />}
                  right={
                    hoursNote ? (
                      <span className='inline-flex items-center gap-1 text-sm text-muted-foreground'>
                        {hoursNote}
                        <ChevronDown size={16} />
                      </span>
                    ) : null
                  }
                >
                  <span
                    className={
                      open === null
                        ? ""
                        : open
                        ? "text-emerald-600 font-medium"
                        : "text-rose-600 font-medium"
                    }
                  >
                    {open === null
                      ? t("hours.unknown")
                      : open
                      ? t("hours.open")
                      : t("hours.closed")}
                  </span>
                </InfoRow>

                {/* 전화 */}
                {clinic.phone && (
                  <InfoRow icon={<Phone size={18} />}>
                    <a href={`tel:${clinic.phone}`} className='no-underline'>
                      {clinic.phone}
                    </a>
                  </InfoRow>
                )}

                {/* Website + 소셜 */}
                {(clinic.website || Object.keys(socials).length > 0) && (
                  <InfoRow icon={<Earth size={18} />}>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <span>Website</span>
                        {clinic.website && (
                          <a
                            href={clinic.website}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary no-underline'
                          >
                            {websiteHost}
                          </a>
                        )}
                      </div>
                      <div className='flex flex-wrap gap-4 text-primary text-sm'>
                        {socials.instagram && (
                          <a
                            href={socials.instagram}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='no-underline'
                          >
                            Instagram
                          </a>
                        )}
                        {socials.line && (
                          <a
                            href={socials.line}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='no-underline'
                          >
                            Line
                          </a>
                        )}
                        {/* whatsapp은 유지하되, 유튜브도 지원 */}
                        {socials.youtube && (
                          <a
                            href={socials.youtube}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='no-underline'
                          >
                            Youtube
                          </a>
                        )}
                        {socials.whatsapp && (
                          <a
                            href={socials.whatsapp}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='no-underline'
                          >
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </InfoRow>
                )}
              </section>
            ) : (
              /* 탭 컨텐츠: reviews */
              <section id='reviews' className='px-4 mt-4'>
                <p className='text-sm text-muted-foreground'>준비중입니다.</p>
              </section>
            )}
          </div>
        </div>

        {/* 병원정보 카드 리스트 */}
        {/* <section
          id='info'
          className='mt-2 divide-y rounded-none md:rounded-2xl md:border bg-card'
        >
          <InfoRow icon={<MapPin size={18} />}>
            <div className='leading-relaxed'>{address}</div>
          </InfoRow>

          <InfoRow icon={<Clock size={18} />}>
            <div className='flex items-center justify-between'>
              <span
                className={
                  open === null
                    ? ""
                    : open
                    ? "text-emerald-600 font-medium"
                    : "text-rose-600 font-medium"
                }
              >
                {open === null
                  ? t("hours.unknown") ?? "영업시간 정보 없음"
                  : open
                  ? t("hours.open") ?? "영업중"
                  : t("hours.closed") ?? "영업종료"}
              </span>
              {hoursNote && (
                <span className='text-xs text-muted-foreground'>
                  {hoursNote}
                </span>
              )}
            </div>
          </InfoRow>

          {clinic.phone && (
            <InfoRow icon={<Phone size={18} />}>
              <a href={`tel:${clinic.phone}`} className='underline'>
                {clinic.phone}
              </a>
            </InfoRow>
          )}

          {(clinic.website || clinic.socials) && (
            <InfoRow icon={<Earth size={18} />}>
              <div className='flex flex-col flex-wrap items-start gap-y-4'>
                <div>
                  {clinic.website && (
                    <a
                      href={clinic.website}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='no-underline hover:underline underline-offset-2'
                    >
                      Website: {clinic.website}
                    </a>
                  )}
                </div>
                <div className='flex gap-4'>
                  {clinic.socials?.instagram && (
                    <a
                      href={clinic.socials.instagram}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='no-underline hover:underline underline-offset-2'
                    >
                      Instagram: {clinic.socials.instagram}
                    </a>
                  )}
                  {clinic.socials?.line && (
                    <a
                      href={clinic.socials.line}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='no-underline hover:underline underline-offset-2'
                    >
                      Line: {clinic.socials.line}
                    </a>
                  )}
                  {clinic.socials?.whatsapp && (
                    <a
                      href={clinic.socials.whatsapp}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='no-underline hover:underline underline-offset-2'
                    >
                      WhatsApp: {clinic.socials.whatsapp}
                    </a>
                  )}
                </div>
              </div>
            </InfoRow>
          )}
        </section> */}
        {/* 병원소개, 비전, 미션 */}
        <section className='space-y-2'>
          <details className='group rounded-2xl border bg-card'>
            <summary className='list-none cursor-pointer px-4 py-3 flex items-center justify-between'>
              <span className='text-xl font-semibold'>
                {t("aboutLabel") ?? "병원소개"}
              </span>
              <span className='i-chevron group-open:rotate-180 transition-transform'>
                {/* 간단한 ▾ 아이콘 */}
                <svg width='18' height='18' viewBox='0 0 24 24'>
                  <path
                    d='M6 9l6 6 6-6'
                    stroke='currentColor'
                    strokeWidth='2'
                    fill='none'
                  />
                </svg>
              </span>
            </summary>

            <div className='flex flex-col gap-4 px-4 pb-4 text-sm leading-7 text-foreground/90'>
              {/* 설명 */}
              <p>{description}</p>

              {/* 비전 */}
              <h3 className='text-xl font-semibold'>{t("visionLabel")}</h3>
              <p>{vision}</p>

              {/* 미션 */}
              <h3 className='text-xl font-semibold'>{t("missionLabel")}</h3>
              <p>{mission}</p>

              {/* 이벤트 안내 */}
              {events.length > 0 && (
                <section className='space-y-2'>
                  <h3 className='text-xl font-semibold'>{t("eventsLabel")}</h3>
                  <ul className='list-disc list-inside text-gray-700'>
                    {events.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </details>
        </section>
        {/* 편의시설 */}
        {clinic.amenities && clinic.amenities.length > 0 && (
          <section className='mt-4 px-4'>
            <div className='rounded-2xl border bg-card p-4'>
              <h2 className='text-base font-semibold mb-3'>
                {t("amenitiesLabel") ?? "편의시설"}
              </h2>
              <div className='grid grid-cols-4 gap-4 text-center text-xs'>
                {clinic.amenities.map((a) => (
                  <div key={a} className='flex flex-col items-center gap-1'>
                    {/* 심플 아이콘 대체: 필요시 매핑 테이블로 교체 */}
                    <div className='w-9 h-9 rounded-full border grid place-items-center'>
                      {/* 기본 아이콘 */}
                      <svg width='18' height='18' viewBox='0 0 24 24'>
                        <circle
                          cx='12'
                          cy='12'
                          r='9'
                          stroke='currentColor'
                          fill='none'
                          strokeWidth='2'
                        />
                      </svg>
                    </div>
                    <span className='truncate'>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        {/* 지도 */}
        <section className='space-y-2'>
          <div className='rounded-2xl border bg-card p-4'>
            <h2 className='text-xl font-semibold mb-3'>
              {t("mapLabel") ?? "지도"}
            </h2>
            <GoogleMapEmbed
              lat={clinic.geo?.lat}
              lng={clinic.geo?.lng}
              address={address}
              locale={loc}
            />
          </div>
        </section>
        {/* 패키지 리스트 */}
        <section className='space-y-2'>
          <h2 className='text-xl font-semibold'>{t("packagesLabel")}</h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            {clinic.packagesList.map((pkg) => {
              const pkgId = encodeURIComponent(pkg.id);

              const title = pickText(pkg.title, loc);
              const subtitle = pickText(pkg.subtitle, loc);

              const durationVal = pickLocalized<number>(pkg.duration, loc);
              const priceVal = pickLocalized<number>(pkg.price, loc);

              const durationText =
                durationVal !== undefined
                  ? formatDuration(loc, durationVal)
                  : "";
              const priceText =
                priceVal !== undefined ? formatPrice(loc, priceVal) : "";

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
                        alt={title || "package image"}
                        fill
                        className='object-cover'
                      />
                    </div>
                  ))}

                  <div className='p-4 space-y-2'>
                    {/* 2. 제목/부제 */}
                    <h3 className='font-medium text-lg'>{title}</h3>
                    <p className='text-sm text-gray-500'>{subtitle}</p>

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
