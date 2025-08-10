"use client";

import React from "react";

type Locale = "ko" | "ja";

interface Props {
  lat?: number;
  lng?: number;
  address?: string;
  placeId?: string; // 있으면 가장 정확
  locale?: Locale;
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
  const hasCoord = typeof lat === "number" && typeof lng === "number";

  // q 값 구성
  const q = placeId
    ? `place_id:${placeId}` // 권장: 장소 고유 식별자
    : hasCoord
    ? `${lat},${lng}`
    : encodeURIComponent(address ?? "");

  // 키가 있고 Embed API를 쓰면 항상 핀이 찍힌 place 모드 사용, 아니면 기존 q 방식
  const src =
    useEmbedApi && key
      ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${q}&zoom=${zoom}&language=${locale}`
      : `https://www.google.com/maps?q=${q}&hl=${locale}&z=${zoom}&output=embed`;

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
