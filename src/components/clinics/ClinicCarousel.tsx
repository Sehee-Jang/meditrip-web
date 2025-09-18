"use client";

import React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

interface ClinicCarouselProps {
  photos: string[];
}

export default function ClinicCarousel({ photos }: ClinicCarouselProps) {
  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 3000 })]}
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
    </Carousel>
  );
}
