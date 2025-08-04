"use client";

import { useTranslations } from "next-intl";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import CommonButton from "../common/CommonButton";
import Container from "../common/Container";

export default function HeroSection() {
  const t = useTranslations("hero-section");

  return (
    <section className='md:py-10 md:mb-10 md:bg-gray-100'>
      <Container className='md:flex md:justify-between md:items-center md:py-4'>
        {/* Carousel 영역 */}
        <div className='w-full md:w-1/2 md:h-[360px]'>
          <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 3000 })]}>
            <CarouselContent>
              {[1, 2, 3].map((item) => (
                <CarouselItem key={item}>
                  {/* 모바일: 정사각형 / 데스크탑: 고정 높이 */}
                  <div className='relative w-full aspect-square md:aspect-auto md:h-[360px] overflow-hidden rounded-md'>
                    <Image
                      src={`/images/hero${item}.png`}
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
        <div className='w-full md:w-1/2 flex flex-col mt-6 md:mt-0 md:pl-10 md:gap-6 gap-1'>
          <h2 className='text-l md:text-4xl font-bold whitespace-pre-line'>
            {t("title")}
          </h2>
          <p className='text-gray-700 text-m md:text-l'>{t("subtitle")}</p>
          <CommonButton className='w-24 md:w-[120px]'>
            {t("button")}
          </CommonButton>
        </div>
      </Container>
    </section>
  );
}
