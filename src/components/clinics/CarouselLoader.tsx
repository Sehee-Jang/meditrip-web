"use client";

import dynamic from "next/dynamic";
import React from "react";

type Props = {
  photos: readonly string[];
  className?: string;
};

// 스켈레톤: 서버에서 먼저 렌더되어 '멈춘 느낌' 제거
function CarouselSkeleton() {
  return (
    <div className='w-full h-60 sm:h-80 md:h-[360px] rounded overflow-hidden border bg-muted/40'>
      <div className='h-full w-full animate-pulse' />
    </div>
  );
}

// 실제 캐러셀은 클라에서만 로드
const ClinicCarouselLazy = dynamic(() => import("./ClinicCarousel"), {
  ssr: false,
  loading: () => <CarouselSkeleton />,
});

export default function CarouselLoader({ photos, className }: Props) {
  return <ClinicCarouselLazy photos={photos} className={className} />;
}
