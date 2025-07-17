"use client";

import { useTranslations } from "next-intl";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

export default function HeroSection() {
  const t = useTranslations("Hero");

  return (
    <section className='py-10 px-4 md:flex md:justify-between md:items-center bg-gray-100 max-w-7xl mx-auto'>
      {/* Carousel 영역 */}
      <div className='w-full md:w-1/2 h-64 md:h-[360px]'>
        <Carousel
          opts={{ loop: true }}
          plugins={[
            Autoplay({
              delay: 3000,
            }),
          ]}
        >
          <CarouselContent>
            {[1, 2, 3].map((item) => (
              <CarouselItem key={item}>
                <div className='relative w-full h-64 md:h-[360px] overflow-hidden rounded-md'>
                  <Image
                    src={`/images/hero${item}.jpg`} // 실제 이미지 경로로 교체
                    alt={`슬라이드 ${item}`}
                    fill
                    className='object-cover'
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* 텍스트 영역 */}
      <div className='w-full md:w-1/2 mt-6 md:mt-0 md:pl-10'>
        <h2 className='text-2xl md:text-3xl font-bold whitespace-pre-line'>
          {t("title")}
        </h2>
        <p className='mt-3 text-gray-700'>{t("subtitle")}</p>
        <button className='mt-5 px-6 py-2 bg-black text-white rounded'>
          {t("button")}
        </button>
      </div>
    </section>
  );
}
