"use client";

import React, { useEffect, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselIndicators,
} from "@/components/ui/carousel";
import Image from "next/image";

type Props = {
  photos: readonly string[];
  className?: string;
};

export default function ClinicCarousel({ photos, className }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [enableAuto, setEnableAuto] = useState(false);

  // 뷰포트 진입 후에만 Autoplay 가동 → 초기 JS/CPU 부담 감소
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setEnableAuto(true);
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className={[
        "w-full h-60 sm:h-80 md:h-[360px] rounded overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Carousel
        opts={{ loop: true }}
        plugins={enableAuto ? [Autoplay({ delay: 2000 })] : []}
        className='w-full h-full'
      >
        <CarouselContent>
          {photos.map((src, idx) => (
            <CarouselItem key={src ?? idx}>
              <div className='relative w-full h-60 sm:h-80 md:h-[360px]'>
                <Image
                  src={src}
                  alt={`hospital image ${idx + 1}`}
                  fill
                  className='object-cover'
                  // 해상도 힌트로 과다 다운로드 방지
                  sizes='(max-width: 640px) 100vw, (max-width: 768px) 100vw, 1024px'
                  // 첫 장만 우선 디코딩
                  priority={idx === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className='pointer-events-none absolute inset-x-0 bottom-3 flex justify-center'>
          <div className='rounded-full bg-black/30 px-3 py-2 backdrop-blur'>
            <CarouselIndicators />
          </div>
        </div>
      </Carousel>
    </div>
  );
}
