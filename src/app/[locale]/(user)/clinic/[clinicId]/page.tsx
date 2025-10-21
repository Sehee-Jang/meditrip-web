import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  getClinicBaseById,
  getClinicPackages,
} from "@/services/clinics/getClinicById";
import type { ClinicDetail, DayOfWeek, PackageWithId } from "@/types/clinic";
import type { Locale } from "@/i18n/routing";
import ClinicTabsBar from "@/components/clinics/ClinicTabsBar";
import FavoriteButton from "@/components/clinics/FavoriteButton";
import GoogleMapEmbed from "@/components/common/GoogleMapEmbed";
import { formatPrice, formatDuration } from "@/lib/format";
import { toSupportedLocale, pickText, pickLocalized } from "@/utils/i18n";
import {
  Clock,
  Earth,
  MapPin,
  Phone,
  Star,
  ChevronDown,
  Car,
  Wifi,
  Info,
  Shield,
  Plane,
} from "lucide-react";
import type { AmenityKey, Doctor } from "@/types/clinic";
import { getTagsCatalogServer } from "@/services/clinics/getTagsCatalog";
import CarouselLoader from "@/components/clinics/CarouselLoader";
import { renderTiptapHTML, isDocEmpty } from "@/utils/tiptapRender";
import IntroSubtitle from "@/components/admin/clinics/IntroSubtitle";

type PageParams = Promise<{ locale: string; clinicId: string }>;
type SearchParams = Promise<{ tab?: string }>;

export const revalidate = 120;

const PACKAGE_CARD_IMAGE_SIZES = "(max-width: 640px) 100vw, 480px";

/** 오늘 지금 시각 기준 영업중 판단 (타임존/오버나이트/마감분 포함 제외) */
function isOpenNow(
  weeklyHours: ClinicDetail["weeklyHours"] | undefined,
  opts?: { timezone?: string; closedDays?: DayOfWeek[] }
): boolean | null {
  if (!weeklyHours) return null;

  const tz = opts?.timezone ?? "Asia/Seoul";
  const closedDays = opts?.closedDays ?? [];

  // 타임존 기준 현재 요일/시각 파트 얻기
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hourStr = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minStr = parts.find((p) => p.type === "minute")?.value ?? "00";

  const weekdayMap: Record<string, DayOfWeek> = {
    Sun: "sun",
    Mon: "mon",
    Tue: "tue",
    Wed: "wed",
    Thu: "thu",
    Fri: "fri",
    Sat: "sat",
  };
  const dayKeys: DayOfWeek[] = [
    "sun",
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
  ];
  const today: DayOfWeek = weekdayMap[weekday] ?? "sun";
  const todayIdx = dayKeys.indexOf(today);
  const prevIdx = (todayIdx + 6) % 7;
  const prev: DayOfWeek = dayKeys[prevIdx];

  const toMin = (hhmm: string): number => {
    const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
    return h * 60 + m;
  };

  const nowMin = parseInt(hourStr, 10) * 60 + parseInt(minStr, 10);
  const minutesInDay = 24 * 60;

  // 특정 요일의 시간대를 "오늘에 해당하는 구간"으로 변환
  // - 같은날 구간(open <= close): [open, close)
  // - 오버나이트(open > close): 오늘분은 [open, 1440)
  const segmentsForToday = (d: DayOfWeek) => {
    const ranges = weeklyHours[d] ?? [];
    return ranges.flatMap((r) => {
      const o = toMin(r.open);
      const c = toMin(r.close);
      if (o === c) return []; // 0분 운영(마감)으로 취급
      if (o < c) {
        // 같은날
        return [[o, c]] as Array<[number, number]>;
      }
      // 오버나이트 → 오늘 분
      return [[o, minutesInDay]] as Array<[number, number]>;
    });
  };

  // 전날의 오버나이트 구간이 오늘 새벽까지 이어지는 부분: [0, close)
  const overnightFromPrevToToday = (d: DayOfWeek) => {
    const ranges = weeklyHours[d] ?? [];
    return ranges.flatMap((r) => {
      const o = toMin(r.open);
      const c = toMin(r.close);
      if (o > c) {
        // 전날 분이 오늘 새벽까지 이어짐
        return [[0, c]] as Array<[number, number]>;
      }
      return [];
    });
  };

  // 휴무일 처리: 명시적으로 휴무이거나 시간대가 없으면 닫힘
  const isExplicitlyClosed = (d: DayOfWeek) =>
    closedDays.includes(d) || (weeklyHours[d]?.length ?? 0) === 0;

  // 오늘 기준에서 유효한 모든 구간
  const segments: Array<[number, number]> = [];
  if (!isExplicitlyClosed(today)) segments.push(...segmentsForToday(today));
  if (!isExplicitlyClosed(prev))
    segments.push(...overnightFromPrevToToday(prev));

  if (segments.length === 0) return false;

  // 마감 시각은 포함하지 않음: [open, close)
  return segments.some(([s, e]) => s <= nowMin && nowMin < e);
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
  const { locale, clinicId } = await params;
  const { tab } = await searchParams;
  const activeTab: "info" | "reviews" = tab === "reviews" ? "reviews" : "info";

  const t = await getTranslations("clinic-detail");
  const tAmenity = await getTranslations("amenities");

  // 업체 기본 문서 즉시 조회
  const clinic = await getClinicBaseById(clinicId);
  if (!clinic) return notFound();

  // 패키지 서브컬렉션은 지연 로딩을 위해 Promise만 준비
  const packagesPromise = getClinicPackages(clinic.id);

  const loc: Locale = toSupportedLocale(locale);

  const name = pickText(clinic.name, loc);
  const address = pickText(clinic.address, loc);
  const introTitle = pickText(clinic.intro?.title ?? null, loc);
  const introSubtitle = pickText(clinic.intro?.subtitle ?? null, loc);
  const descriptionDoc =
    (clinic.description as Record<string, unknown>)?.[loc] ?? null;
  const highlightsDoc =
    (clinic.highlights as Record<string, unknown>)?.[loc] ?? null;
  const hoursNote = pickText(clinic.hoursNote ?? null, loc);
  const events = pickLocalized<string[]>(clinic.events ?? null, loc) ?? [];
  const open = isOpenNow(clinic.weeklyHours);
  const websiteHost = clinic.website ? new URL(clinic.website).hostname : null;
  const socials = (clinic.socials ?? {}) as Partial<
    Record<"instagram" | "line" | "youtube" | "whatsapp", string>
  >;

  // 태그
  const tagCatalog = await getTagsCatalogServer();

  // 기존 tags 배열을 slug 리스트로 유지하고 있다면:
  const tagLabels = (clinic.tagSlugs ?? [])
    .map((slug) => {
      const hit = tagCatalog.find((t) => t.slug === slug);
      return hit ? hit.labels[loc] || hit.slug : slug;
    })
    .filter((s) => s);

  // 별점
  const rating =
    "rating" in clinic
      ? (clinic as { rating?: { avg?: number; count?: number } }).rating
      : undefined;
  const ratingAvg = typeof rating?.avg === "number" ? rating?.avg : undefined;
  const ratingCount =
    typeof rating?.count === "number" ? rating?.count : undefined;

  const reservationNotices =
    pickLocalized<string[]>(clinic.reservationNotices ?? null, loc) ?? [];

  const doctors: Doctor[] = clinic.doctors ?? [];

  const packagesLabel = t("packagesLabel");
  const highlightsLabel = t("highlightsLabel") ?? "Highlights";
  const eventsLabel = t("eventsLabel") ?? "예약 이벤트";

  // 편의시설 아이콘/라벨 매핑
  const AMENITY_ICONS: Record<AmenityKey, React.ReactNode> = {
    parking: <Car size={24} />,
    freeWifi: <Wifi size={24} />,
    infoDesk: <Info size={24} />,
    privateCare: <Shield size={24} />,
    airportPickup: <Plane size={24} />,
  };

  // 안전 가드: clinic.amenities가 배열이 아닐 수도 있으니 배열 보장
  const amenities = Array.isArray(clinic.amenities) ? clinic.amenities : [];

  // AmenityKey 타입 가드 (알 수 없는 값이 섞여도 안전)
  const isAmenityKey = (v: unknown): v is AmenityKey =>
    typeof v === "string" && v in AMENITY_ICONS;

  // 표시 여부 플래그
  const hasIntroTitle =
    typeof introTitle === "string" && introTitle.trim().length > 0;
  const hasIntroSubtitle =
    typeof introSubtitle === "string" && introSubtitle.trim().length > 0;
  const hasDescription = !isDocEmpty(descriptionDoc ?? undefined);
  const hasHighlights = !isDocEmpty(highlightsDoc ?? undefined);
  const hasDoctors = (doctors?.length ?? 0) > 0;
  const hasAmenities = amenities.some(isAmenityKey);
  const hasEvents = (events?.length ?? 0) > 0;
  // const hasPackages = (clinic.packagesList?.length ?? 0) > 0;
  const hasReservationNotices = (reservationNotices?.length ?? 0) > 0;
  const hasAddress = !!address && address.trim().length > 0;
  const hasPhone = !!clinic.phone && clinic.phone.trim().length > 0;
  const hasWebsiteOrSocials =
    !!clinic.website || Object.keys(socials).length > 0;

  // 주간 영업시간이 하루라도 등록되어 있는지
  const hasHours = Object.values(clinic.weeklyHours ?? {}).some(
    (arr) => (arr?.length ?? 0) > 0
  );

  // 지도는 좌표가 있거나 주소가 있으면 노출
  const hasMap =
    (clinic.geo?.lat != null && clinic.geo?.lng != null) || hasAddress;

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader desktopTitle={name} mobileTitle={name} showBackIcon center>
        {/* 모바일 전용 하트(헤더 내부) */}
        <div className='md:hidden'>
          <FavoriteButton clinicId={clinicId} className='p-1' />
        </div>
      </PageHeader>

      <section className='max-w-4xl mx-auto px-4 py-6 flex flex-col gap-8'>
        {/* 대표 이미지 슬라이더 */}
        <div className='relative '>
          <CarouselLoader photos={clinic.images} />
          <div className='absolute top-3 right-3 hidden md:block'>
            <FavoriteButton
              clinicId={clinic.id}
              className='rounded-full bg-card/90 p-2 shadow backdrop-blur hover:bg-card'
            />
          </div>
        </div>

        {/* 타이틀 + 위치 + 별점 + 태그 */}
        <div className='px-4 pt-4'>
          {/* 업체명 */}
          <h1 className='text-2xl font-semibold'>{name}</h1>

          {/* intro.title */}
          {hasIntroTitle && (
            <p className='mt-3 text-base md:text-lg font-medium leading-snug'>
              {introTitle}
            </p>
          )}

          {/* intro.subtitle — 1줄만 보여주고 버튼으로 펼치기 */}
          {hasIntroSubtitle && (
            <IntroSubtitle text={introSubtitle} minLengthToShowToggle={50} />
          )}

          {/* 주소 */}
          <div className='mt-2 flex items-center gap-2 text-base text-primary/90'>
            <MapPin size={16} />
            <span>{address}</span>
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

          {/* 태그 */}
          {tagLabels.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-2'>
              {tagLabels.map((label, i) => (
                <span
                  key={`${label}-${i}`}
                  className='inline-flex rounded-md border border-border bg-background px-2.5 py-1 text-xs'
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 탭 네비게이션 */}
        <div className='mt-2'>
          <ClinicTabsBar
            initialValue={activeTab}
            labels={{ info: t("infoTab"), reviews: t("reviewsTab") }}
          />

          {/* 탭 컨텐츠: info / reviews */}
          <div>
            {activeTab === "info" ? (
              <section className='mt-2 divide-y divide-border rounded-2xl border border-border bg-card'>
                {/* <section className='mt-2 border-b divide-y'> */}
                {/* 주소 */}
                <InfoRow icon={<MapPin size={18} />}>
                  <div className='leading-relaxed'>{address}</div>
                </InfoRow>

                {/* 영업시간 */}
                {hasHours &&
                  (() => {
                    const dayOrder: DayOfWeek[] = [
                      "mon",
                      "tue",
                      "wed",
                      "thu",
                      "fri",
                      "sat",
                      "sun",
                    ];
                    const pairs: Array<[DayOfWeek, DayOfWeek | null]> = [
                      ["mon", "tue"],
                      ["wed", "thu"],
                      ["fri", "sat"],
                      ["sun", null],
                    ];

                    const dayLabels = t.raw("hours.dayLabels") as Record<
                      Locale,
                      Record<DayOfWeek, string>
                    >;
                    const closedShort = t.raw("hours.closedShort") as Record<
                      Locale,
                      string
                    >;
                    const noInfo = t.raw("hours.noInfo") as Record<
                      Locale,
                      string
                    >;
                    const dayLabelsForLocale = dayLabels[loc] ?? dayLabels.en;
                    const closedText = closedShort[loc] ?? closedShort.en;
                    const noInfoText = noInfo[loc] ?? noInfo.en;

                    const hours = clinic.weeklyHours ?? {};
                    const closedDays = clinic.weeklyClosedDays ?? [];
                    const hasAny = dayOrder.some(
                      (d) => (hours[d]?.length ?? 0) > 0
                    );

                    const labelColor =
                      open === null
                        ? ""
                        : open
                        ? "text-emerald-600 font-medium"
                        : "text-rose-600 font-medium";

                    const todayKey: DayOfWeek = (
                      ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const
                    )[new Date().getDay()];

                    const isClosed = (d: DayOfWeek) =>
                      closedDays.includes(d) || (hours[d]?.length ?? 0) === 0;

                    const textFor = (d: DayOfWeek) =>
                      (hours[d]?.length ?? 0) > 0
                        ? hours[d]!.map((r) => `${r.open} – ${r.close}`).join(
                            ", "
                          )
                        : closedText;

                    const Cell = ({ d }: { d: DayOfWeek }) => (
                      <div className='grid grid-cols-[28px_1fr] items-baseline gap-3'>
                        <span
                          className={[
                            "w-7 text-muted-foreground",
                            todayKey === d ? "text-foreground font-medium" : "",
                          ].join(" ")}
                        >
                          {dayLabelsForLocale[d] ?? dayLabels.en[d]}
                        </span>
                        <span
                          className={[
                            "font-mono tabular-nums",
                            isClosed(d)
                              ? "text-muted-foreground"
                              : "font-medium",
                          ].join(" ")}
                        >
                          {textFor(d)}
                        </span>
                      </div>
                    );

                    return (
                      <details className='group border-t border-border'>
                        <summary className='list-none cursor-pointer'>
                          <div className='flex items-center gap-3 px-4 py-4 text-[15px]'>
                            <span className='mt-0.5 shrink-0 text-muted-foreground'>
                              <Clock size={18} />
                            </span>
                            <div className='flex-1'>
                              <span className={labelColor}>
                                {open === null
                                  ? t("hours.unknown")
                                  : open
                                  ? t("hours.open")
                                  : t("hours.closed")}
                              </span>
                            </div>
                            <span className='ml-3 inline-flex shrink-0 items-center gap-2 text-sm text-muted-foreground'>
                              {hoursNote}
                              <ChevronDown
                                size={16}
                                className='transition-transform group-open:rotate-180'
                              />
                            </span>
                          </div>
                        </summary>

                        <div className='pl-12 pr-4 pb-4'>
                          {hasAny ? (
                            <div className='grid grid-cols-2 gap-x-10 gap-y-2'>
                              {pairs.map(([a, b]) => (
                                <React.Fragment key={a + (b ?? "")}>
                                  <Cell d={a} />
                                  {b ? <Cell d={b} /> : <div />}
                                </React.Fragment>
                              ))}
                            </div>
                          ) : (
                            <p className='text-sm text-muted-foreground'>
                              {noInfoText}
                            </p>
                          )}
                        </div>
                      </details>
                    );
                  })()}

                {/* 전화 */}
                {hasPhone && (
                  <InfoRow icon={<Phone size={18} />}>
                    <a href={`tel:${clinic.phone}`} className='no-underline'>
                      {clinic.phone}
                    </a>
                  </InfoRow>
                )}

                {/* Website + 소셜 */}
                {hasWebsiteOrSocials && (
                  <InfoRow icon={<Earth size={18} />}>
                    <div className='space-y-1'>
                      {/* Website */}
                      <div className='flex items-center gap-2'>
                        <span className=''>Website: </span>
                        {clinic.website && (
                          <span className='font-semibold'>
                            <a
                              href={clinic.website}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-primary no-underline'
                            >
                              {websiteHost}
                            </a>
                          </span>
                        )}
                      </div>

                      {/* instagram */}
                      <div className='flex flex-wrap gap-4 text-primary text-sm'>
                        {socials.instagram && (
                          <div>
                            <span>Instagram: </span>
                            <span className='font-semibold'>
                              <a
                                href={`https://www.instagram.com/${socials.instagram}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='no-underline'
                              >
                                {socials.instagram}
                              </a>
                            </span>
                          </div>
                        )}
                        {socials.line && (
                          <div>
                            <span>Line: </span>
                            <span className='font-semibold'>
                              {socials.line}
                            </span>
                          </div>
                        )}
                        {/* whatsapp */}
                        {socials.whatsapp && (
                          <div>
                            <span>WhatsApp: </span>
                            <span className='font-semibold'>
                              {socials.whatsapp}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </InfoRow>
                )}
              </section>
            ) : (
              /* 탭 컨텐츠: reviews */
              <section id='reviews' className='px-4 mt-4'>
                <div className='grid place-items-center rounded-2xl border border-border bg-card px-6 py-20 text-center'>
                  <h3 className='text-2xl md:text-3xl font-bold tracking-tight'>
                    {t("reviews.comingSoon")}
                  </h3>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    {t("reviews.comingSoonDesc")}
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Introduce */}
        {hasDescription && (
          <section className='space-y-2'>
            <details className='group rounded-2xl border bg-card'>
              <summary className='list-none cursor-pointer px-4 py-3 flex items-center justify-between'>
                <span className='text-xl font-semibold'>
                  {t("aboutLabel") ?? "Introduce"}
                </span>
                <ChevronDown
                  size={18}
                  className='text-muted-foreground transition-transform group-open:rotate-180'
                />
              </summary>

              <div className='flex flex-col gap-4 px-8  py-4 text-sm leading-7 text-foreground/90'>
                {/* 설명 */}
                <div
                  className='prose prose-sm max-w-none dark:prose-invert
                     prose-p:my-3 prose-ul:my-2 prose-li:my-0.5 prose-img:rounded-xl'
                  dangerouslySetInnerHTML={{
                    __html: renderTiptapHTML(descriptionDoc),
                  }}
                />
              </div>
            </details>
          </section>
        )}

        {/* Highlights */}
        {/* {hasHighlights && (
          <section className='space-y-2'>
            <details className='group rounded-2xl border bg-card'>
              <summary className='list-none cursor-pointer px-4 py-3 flex items-center justify-between'>
                <span className='text-xl font-semibold'>
                  {t("highlightsLabel") ?? "Highlights"}
                </span>
                <ChevronDown
                  size={18}
                  className='text-muted-foreground transition-transform group-open:rotate-180'
                />
              </summary>

              <div className='flex flex-col gap-4 px-8  py-4 text-sm leading-7 text-foreground/90'>
                <div
                  className='prose prose-sm max-w-none dark:prose-invert
                            prose-p:my-3 prose-ul:my-2 prose-li:my-0.5
                            prose-img:rounded-xl'
                  dangerouslySetInnerHTML={{
                    __html: renderTiptapHTML(highlightsDoc),
                  }}
                />
              </div>
            </details>
          </section>
        )} */}

        <Suspense
          fallback={<ClinicHighlightsSkeleton label={highlightsLabel} />}
        >
          <ClinicHighlightsSection
            hasHighlights={hasHighlights}
            highlightsDoc={highlightsDoc}
            label={highlightsLabel}
          />
        </Suspense>

        {/* 의료진 소개 */}
        {hasDoctors && (
          <section className='space-y-2'>
            <details className='group rounded-2xl border bg-card'>
              <summary className='list-none cursor-pointer px-4 py-3 flex items-center justify-between'>
                <span className='text-xl font-semibold'>
                  {t("doctorsLabel") ?? "의료진 소개"}
                </span>
                <ChevronDown
                  size={18}
                  className='text-muted-foreground transition-transform group-open:rotate-180'
                />
              </summary>

              <div className='px-8 py-4 text-foreground/90'>
                {/* 목록 시맨틱 보강 */}
                <ul className='space-y-6'>
                  {doctors.map((d, idx) => {
                    const doctorName = pickText(d.name, loc);
                    const lines = pickLocalized<string[]>(d.lines, loc) ?? [];
                    return (
                      <li
                        key={idx} // 가능하면 고유 id/사진 URL 등 안정 키로 교체 권장
                        className='grid grid-cols-[112px_1fr] md:grid-cols-[160px_1fr] gap-6 items-start'
                      >
                        {/* 사진: 모바일 112, 데스크톱 160 */}
                        <div className='relative w-[112px] h-[112px] md:w-[160px] md:h-[160px] rounded-xl overflow-hidden border bg-muted'>
                          {d.photoUrl ? (
                            <Image
                              src={d.photoUrl}
                              alt={doctorName || "doctor photo"}
                              fill
                              sizes='(min-width: 768px) 160px, 112px'
                              className='object-cover'
                            />
                          ) : null}
                        </div>

                        {/* 이름 + 경력 */}
                        <div className='text-sm leading-7'>
                          <div className='text-base md:text-lg font-medium'>
                            {doctorName}
                          </div>
                          {lines.length > 0 && (
                            <ul className='mt-2 list-disc list-inside text-foreground/80 space-y-1'>
                              {lines.map((l, i) => (
                                <li key={i}>{l}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </details>
          </section>
        )}

        {/* 편의시설 */}
        {hasAmenities && (
          <section className='space-y-2'>
            <details className='group rounded-2xl border bg-card'>
              <summary className='list-none cursor-pointer px-4 py-3 flex items-center justify-between'>
                <span className='text-xl font-semibold'>
                  {t("amenitiesLabel") ?? "편의시설"}
                </span>
                <ChevronDown
                  size={18}
                  className='text-muted-foreground transition-transform group-open:rotate-180'
                />
              </summary>

              <div className='flex flex-col gap-4 px-4 py-4 text-sm leading-7 text-foreground/90'>
                <ul className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-4'>
                  {amenities.filter(isAmenityKey).map((a) => (
                    <li key={a} className='flex flex-col items-center gap-1'>
                      <span className='inline-flex items-center justify-center'>
                        {AMENITY_ICONS[a]}
                      </span>
                      <span className='text-sm '>{tAmenity(a)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </section>
        )}

        {/* 이벤트 안내 */}
        {/* {hasEvents && (
          <section className='space-y-2'>
            <details className='group rounded-2xl border bg-card'>
              <summary className='list-none cursor-pointer px-4 py-3 flex items-center justify-between'>
                <span className='text-xl font-semibold'>
                  {t("eventsLabel") ?? "예약 이벤트"}
                </span>
                <ChevronDown
                  size={18}
                  className='text-muted-foreground transition-transform group-open:rotate-180'
                />
              </summary>

              <div className='flex flex-col px-8 pb-4 text-sm leading-7 text-foreground/90'>
                <ul className='mt-2 list-disc list-inside text-sm text-foreground/80 space-y-1'>
                  {events.map((ev, idx) => (
                    <li key={`${ev}-${idx}`}>{ev}</li>
                  ))}
                </ul>
              </div>
            </details>
          </section>
        )} */}
        <Suspense fallback={<ClinicEventsSkeleton label={eventsLabel} />}>
          <ClinicEventsSection
            hasEvents={hasEvents}
            events={events}
            label={eventsLabel}
          />
        </Suspense>

        {/* 지도 */}
        {hasMap && (
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
        )}

        {/* 패키지 리스트 */}
        <Suspense fallback={<ClinicPackagesSkeleton label={packagesLabel} />}>
          <ClinicPackagesSection
            locale={locale}
            clinicId={clinicId}
            loc={loc}
            label={packagesLabel}
            packagesPromise={packagesPromise}
          />
        </Suspense>

        {/* 예약 시 주의사항 */}
        {hasReservationNotices && (
          <section className='space-y-2'>
            <div className='rounded-2xl border bg-card'>
              <h2 className='text-xl font-semibold px-4 py-3'>
                {t("reservationNoticesLabel")}
              </h2>
              <ul className='list-disc list-inside text-sm text-foreground/80 space-y-1 px-8 pb-4 '>
                {reservationNotices.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

async function ClinicPackagesSection({
  locale,
  clinicId,
  loc,
  label,
  packagesPromise,
}: {
  locale: string;
  clinicId: string;
  loc: Locale;
  label: string;
  packagesPromise: Promise<PackageWithId[]>;
}) {
  const packages = await packagesPromise;
  if (packages.length === 0) return null;

  return (
    <section className='space-y-2 '>
      <h2 className='text-xl font-semibold'>{label}</h2>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        {packages.map((pkg) => {
          const pkgId = encodeURIComponent(pkg.id);

          const title = pickText(pkg.title, loc);
          const subtitle = pickText(pkg.subtitle, loc);

          // const durationVal = pickLocalized<number>(pkg.duration, loc);
          const priceVal = pickLocalized<number>(pkg.price, loc);

          const durationText =
            typeof pkg.duration === "number" && Number.isFinite(pkg.duration)
              ? formatDuration(loc, pkg.duration)
              : "";
          const priceText =
            priceVal !== undefined ? formatPrice(loc, priceVal) : "";

          return (
            <Link
              key={pkg.id}
              href={`/${locale}/clinic/${clinicId}/package/${pkgId}`}
              className='overflow-hidden rounded-2xl border transition hover:bg-accent hover:shadow-sm'
            >
              {pkg.packageImages?.map((img, i) => (
                <div key={i} className='relative h-80 w-full'>
                  <Image
                    src={img}
                    alt={title || "package image"}
                    fill
                    sizes={PACKAGE_CARD_IMAGE_SIZES}
                    className='object-cover'
                  />
                </div>
              ))}

              <div className='space-y-2 p-4'>
                <h3 className='text-lg font-medium'>{title}</h3>
                <p className='text-sm text-muted-foreground'>{subtitle}</p>

                <div className='mt-2 flex items-center justify-between text-foreground/80'>
                  <span>{durationText}</span>
                  <span>{priceText}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

async function ClinicHighlightsSection({
  hasHighlights,
  highlightsDoc,
  label,
}: {
  hasHighlights: boolean;
  highlightsDoc: unknown;
  label: string;
}) {
  if (!hasHighlights) return null;

  return (
    <section className='space-y-2'>
      <details className='group rounded-2xl border bg-card'>
        <summary className='flex cursor-pointer list-none items-center justify-between px-4 py-3'>
          <span className='text-xl font-semibold'>{label}</span>
          <ChevronDown
            size={18}
            className='text-muted-foreground transition-transform group-open:rotate-180'
          />
        </summary>

        <div className='flex flex-col gap-4 px-8 py-4 text-sm leading-7 text-foreground/90'>
          <div
            className='prose prose-sm max-w-none dark:prose-invert prose-p:my-3 prose-ul:my-2 prose-li:my-0.5 prose-img:rounded-xl'
            dangerouslySetInnerHTML={{
              __html: renderTiptapHTML(highlightsDoc),
            }}
          />
        </div>
      </details>
    </section>
  );
}

async function ClinicEventsSection({
  hasEvents,
  events,
  label,
}: {
  hasEvents: boolean;
  events: string[];
  label: string;
}) {
  if (!hasEvents) return null;

  return (
    <section className='space-y-2'>
      <details className='group rounded-2xl border bg-card'>
        <summary className='flex cursor-pointer list-none items-center justify-between px-4 py-3'>
          <span className='text-xl font-semibold'>{label}</span>
          <ChevronDown
            size={18}
            className='text-muted-foreground transition-transform group-open:rotate-180'
          />
        </summary>

        <div className='flex flex-col px-8 pb-4 text-sm leading-7 text-foreground/90'>
          <ul className='mt-2 list-disc list-inside space-y-1 text-sm text-foreground/80'>
            {events.map((ev, idx) => (
              <li key={`${ev}-${idx}`}>{ev}</li>
            ))}
          </ul>
        </div>
      </details>
    </section>
  );
}

function ClinicPackagesSkeleton({ label }: { label: string }) {
  return (
    <section className='space-y-2'>
      <h2 className='text-xl font-semibold text-muted-foreground/80'>
        {label}
      </h2>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className='overflow-hidden rounded-2xl border border-border bg-card'
          >
            <div
              className='h-40 w-full bg-muted/70 animate-pulse'
              aria-hidden
            />
            <div className='space-y-3 p-4'>
              <div className='h-4 w-3/4 rounded bg-muted/70 animate-pulse' />
              <div className='h-3 w-2/3 rounded bg-muted/60 animate-pulse' />
              <div className='mt-2 flex items-center justify-between'>
                <div className='h-3 w-16 rounded bg-muted/60 animate-pulse' />
                <div className='h-3 w-20 rounded bg-muted/60 animate-pulse' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClinicHighlightsSkeleton({ label }: { label: string }) {
  return (
    <section className='space-y-2'>
      <div className='rounded-2xl border bg-card'>
        <div className='flex items-center justify-between px-4 py-3'>
          <span className='text-xl font-semibold text-muted-foreground/80'>
            {label}
          </span>
          <ChevronDown size={18} className='text-muted-foreground/60' />
        </div>
        <div className='space-y-3 px-8 pb-6'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='h-3 w-full rounded bg-muted/60 animate-pulse'
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ClinicEventsSkeleton({ label }: { label: string }) {
  return (
    <section className='space-y-2'>
      <div className='rounded-2xl border bg-card'>
        <div className='flex items-center justify-between px-4 py-3'>
          <span className='text-xl font-semibold text-muted-foreground/80'>
            {label}
          </span>
          <ChevronDown size={18} className='text-muted-foreground/60' />
        </div>
        <div className='space-y-2 px-8 pb-6'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='h-3 w-full rounded bg-muted/60 animate-pulse'
            />
          ))}
        </div>
      </div>
    </section>
  );
}
