import type { Locale } from "@/i18n/routing";
import { toSupportedLocale } from "@/utils/i18n";
import React from "react";

interface Props {
  lat?: number;
  lng?: number;
  address?: string;
  placeId?: string; // 있으면 가장 정확
  locale?: Locale | string; // 문자열도 받아서 내부에서 보정
  zoom?: number; // 0~21
  height?: number; // px
  className?: string;
  useEmbedApi?: boolean; // 기본 true 권장
}

export default function GoogleMapEmbed({
  lat,
  lng,
  address,
  placeId,
  locale = "ko",
  zoom = 16,
  height = 320,
  className,
  useEmbedApi = true,
}: Props) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;

  const hasCoord = Number.isFinite(lat) && Number.isFinite(lng);
  const loc = toSupportedLocale(locale);

  // q 원본 문자열
  const qRaw = placeId
    ? `place_id:${placeId}`
    : hasCoord
    ? `${lat},${lng}`
    : address ?? "";

  // 주소/좌표/플레이스ID가 전혀 없으면 렌더 생략
  if (!qRaw) return null;

  // 범위 보정 및 URL 인코딩
  const z = Math.min(21, Math.max(0, zoom));
  const q = encodeURIComponent(qRaw);

  // 키가 있고 Embed API 사용이면 place 엔드포인트 사용, 아니면 쿼리 방식
  const src =
    useEmbedApi && key
      ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${q}&zoom=${z}&language=${loc}`
      : `https://www.google.com/maps?q=${q}&hl=${loc}&z=${z}&output=embed`;

  return (
    <div className={className}>
      <div
        className='w-full overflow-hidden rounded-xl border'
        style={{ height }}
      >
        <iframe
          title='Google Map'
          src={src}
          loading='lazy'
          referrerPolicy='no-referrer-when-downgrade'
          className='h-full w-full'
          allowFullScreen
        />
      </div>
    </div>
  );
}
