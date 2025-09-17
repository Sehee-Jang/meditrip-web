"use client";

import { useState, useEffect } from "react";
import type { TourListItem } from "@/types/kto-wellness";
import TourCardExtra from "./TourCardExtra";
import { Globe } from "lucide-react";
import { resolveBaseUrl } from "@/utils/baseUrl";
import { resolveTourImageSrc } from "@/utils/tourImage";
import type { TourThemeCode } from "@/constants/tourTheme";

type Props = {
  lang: "ko" | "ja";
  item: TourListItem;
  forcedThemeCode?: TourThemeCode;
};

type DetailMini = {
  homepage?: string;
  hours?: string;
  parking?: string;
  fee?: string;
  contact?: string;
};

type IntroField = { label: string; value: string };
type NamedText = { name?: unknown; text?: unknown };
type DetailResponse = {
  homepage?: string;
  phone?: string;
  introFields?: IntroField[];
  info?: { extras?: unknown };
};

/** 구글맵 링크 생성 */
function googleMapsHref(
  address?: string,
  coord?: { lat: number; lng: number } | null
) {
  if (coord)
    return `https://www.google.com/maps?q=${coord.lat},${coord.lng}&z=15`;
  if (address)
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
  return "https://www.google.com/maps";
}

/** 구글맵 임베드 링크 생성 */
function googleMapsEmbed(
  address?: string,
  coord?: { lat: number; lng: number } | null
) {
  if (coord)
    return `https://www.google.com/maps?q=${coord.lat},${coord.lng}&z=15&output=embed`;
  if (address)
    return `https://www.google.com/maps?q=${encodeURIComponent(
      address
    )}&z=15&output=embed`;
  return `https://www.google.com/maps?output=embed`;
}

/** introFields에서 우선순위 라벨로 값 찾기 */
function pickIntro(intros: IntroField[] | undefined, labels: string[]) {
  if (!intros) return undefined;
  for (const l of labels) {
    const row = intros.find((r) => r.label === l);
    if (row && row.value) return row.value;
  }
  return undefined;
}

/** 엔티티 디코드 */
function decodeEntities(s = "") {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** 홈페이지 정규화(클라이언트 방어용) */
function normalizeHomepage(raw?: string): string | undefined {
  if (!raw) return undefined;
  const dec = decodeEntities(String(raw).trim());
  const mHref = dec.match(/href\s*=\s*["']([^"']+)["']/i);
  let url = (mHref?.[1] ?? "").trim();
  if (!url) {
    const mText = dec.match(/>(https?:\/\/[^<]+)</i);
    if (mText) url = mText[1].trim();
  }
  if (!url && /^https?:\/\//i.test(dec)) url = dec;
  return /^https?:\/\//i.test(url) ? url : undefined;
}

/** extras 배열에서 '입장' 또는 '요금'이 들어간 name을 찾아 text 반환 */
function feeFromExtras(extras: unknown): string | undefined {
  if (!Array.isArray(extras)) return undefined;
  for (const ex of extras) {
    if (ex && typeof ex === "object") {
      const obj = ex as NamedText;
      const name = obj?.name;
      const text = obj?.text;
      if (typeof name === "string" && /입\s*장|요금/.test(name)) {
        if (typeof text === "string") return text;
      }
    }
  }
  return undefined;
}

export default function TourCard({ lang, item, forcedThemeCode }: Props) {
  const [detail, setDetail] = useState<DetailMini | null>(null);
  const [openMap, setOpenMap] = useState(false);

  // 상세 비동기 보강: 운영시간/주차/이용요금/홈페이지
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const base = resolveBaseUrl();
        const url = `${base}/api/kto/wellness/${encodeURIComponent(
          item.id
        )}/detail?lang=${lang}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`detail ${res.status}`);

        const d = (await res.json()) as DetailResponse;
        if (cancelled) return;

        const hours = pickIntro(d.introFields, ["이용시간"]);
        const parking = pickIntro(d.introFields, ["주차"]);

        const fee =
          pickIntro(d.introFields, ["이용요금"]) ??
          feeFromExtras(d.info?.extras);

        const contact =
          item.phone || d.phone || pickIntro(d.introFields, ["문의"]);

        setDetail({
          homepage: d.homepage || item.homepage,
          hours,
          parking,
          fee,
          contact,
        });
      } catch {
        // 실패 시 무시(카드는 목록 정보만 표시)
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [item.id, lang, item.homepage, item.phone]);

  const imgSrc = resolveTourImageSrc(item, forcedThemeCode);
  const addr = item.address || "-";

  // 상세값이 비정상일 때 목록값으로 폴백 + 정규화
  const homepage =
    normalizeHomepage(detail?.homepage) ?? normalizeHomepage(item.homepage);

  const mapHref = googleMapsHref(item.address, item.coord);
  const embedSrc = googleMapsEmbed(item.address, item.coord);

  return (
    <div className='h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm'>
      {/* 이미지 */}
      <div className='relative aspect-video w-full overflow-hidden rounded-t-xl bg-muted'>
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={item.title}
            className='absolute inset-0 h-full w-full object-cover'
            loading='lazy'
            decoding='async'
          />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center text-sm text-muted-foreground'>
            {lang === "ko" ? "이미지 없음" : "No image"}
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className='p-4'>
        <div className='mb-1 line-clamp-2 font-semibold'>{item.title}</div>

        {/* 주소: 클릭 시 구글맵 새창 */}
        <button
          type='button'
          className='line-clamp-2 text-left text-sm text-primary underline underline-offset-2'
          onClick={() => window.open(mapHref, "_blank", "noopener")}
          title={lang === "ko" ? "구글맵에서 보기" : "Open in Google Maps"}
        >
          {addr}
        </button>

        <div className='mt-3 grid gap-1.5 text-sm'>
          {/* 홈페이지(있는 경우만) */}
          {homepage ? (
            <div className='flex items-start gap-2'>
              <span className='mt-[2px] shrink-0 text-muted-foreground'>
                <Globe className='h-4 w-4' aria-hidden />
                <span className='sr-only'>
                  {lang === "ko" ? "홈페이지" : "Website"}
                </span>
              </span>
              <a
                href={homepage}
                target='_blank'
                rel='noopener noreferrer'
                className='truncate underline underline-offset-2'
                title={homepage}
              >
                {homepage.replace(/^https?:\/\//i, "")}
              </a>
            </div>
          ) : null}
        </div>

        {/* 기본 정보(연락처 / 운영시간 / 주차 / 비용) */}
        <TourCardExtra
          contentId={item.id}
          lang={lang}
          fallbackPhone={item.phone}
        />

        {/* 액션 */}
        <div className='mt-4 flex gap-2'>
          <button
            type='button'
            className='rounded-lg border px-3 py-1.5 text-sm hover:bg-accent'
            onClick={() => setOpenMap(true)}
          >
            {lang === "ko" ? "지도 보기" : "Map"}
          </button>
          <a
            className='rounded-lg border px-3 py-1.5 text-sm hover:bg-accent'
            href={mapHref}
            target='_blank'
            rel='noopener noreferrer'
          >
            {lang === "ko" ? "구글맵 열기" : "Open Google Maps"}
          </a>
        </div>
      </div>

      {/* 미니맵 모달 */}
      {openMap && (
        <div
          className='fixed inset-0 z-50 grid place-items-center bg-black/50 p-4'
          onClick={() => setOpenMap(false)}
        >
          <div
            className='w-full max-w-2xl overflow-hidden rounded-xl bg-background shadow-lg'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center justify-between border-b px-4 py-2'>
              <div className='font-medium'>
                {lang === "ko" ? "지도" : "Map"} · {item.title}
              </div>
              <button
                type='button'
                className='rounded-md px-2 py-1 text-sm hover:bg-accent'
                onClick={() => setOpenMap(false)}
              >
                {lang === "ko" ? "닫기" : "Close"}
              </button>
            </div>
            <div className='aspect-video w-full'>
              <iframe
                title='map'
                src={embedSrc}
                className='h-full w-full'
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
                allowFullScreen
              />
            </div>
            <div className='flex items-center justify-between border-t px-4 py-2 text-sm'>
              <span className='truncate'>{addr}</span>
              <a
                href={mapHref}
                target='_blank'
                rel='noopener noreferrer'
                className='rounded-md border px-2 py-1 hover:bg-accent'
              >
                {lang === "ko" ? "구글맵에서 열기" : "Open in Maps"}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
