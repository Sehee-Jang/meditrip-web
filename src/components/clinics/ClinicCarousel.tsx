"use client";

import React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselIndicators,
} from "@/components/ui/carousel";
import Image from "next/image";

interface ClinicCarouselProps {
  photos: string[];
}

export default function ClinicCarousel({ photos }: ClinicCarouselProps) {
  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 2000 })]}
      className='w-full h-60 sm:h-80 md:h-[360px] rounded overflow-hidden'
    >
      <CarouselContent>
        {photos.map((src, idx) => (
          <CarouselItem key={idx}>
            <div className='relative w-full h-60 sm:h-80 md:h-[360px]'>
              <Image
                src={src}
                alt={`Hospital image ${idx + 1}`}
                fill
                className='object-cover'
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* 인디케이터: 하단 중앙 오버레이 */}
      <div className='pointer-events-none absolute inset-x-0 bottom-3 flex justify-center'>
        <div className='rounded-full bg-black/30 px-3 py-2 backdrop-blur'>
          <CarouselIndicators />
        </div>
      </div>
    </Carousel>
  );
}
