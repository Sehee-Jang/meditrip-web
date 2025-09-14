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
import { useRef } from "react";
import Link from "next/link";

export default function HeroSection() {
  const t = useTranslations("hero-section");

  const autoplay = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  return (
    <section className='relative w-full h-[360px] md:h-[480px] mb-10'>
      {/* 슬라이드 이미지 */}
      <Carousel opts={{ loop: true }} plugins={[autoplay.current]}>
        <CarouselContent>
          {[1, 2, 3].map((item) => (
            <CarouselItem key={item}>
              <div className='relative w-full h-[360px] md:h-[480px]'>
                <Image
                  src={`/images/hero${item}.webp`}
                  alt={`슬라이드 ${item}`}
                  fill
                  sizes='(min-width: 768px) 100vw, 100vw'
                  className='object-cover object-center'
                  priority={item === 1}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* 오버레이 텍스트 영역 */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <Container className='pb-0 text-center text-white px-4'>
          <h2 className='text-2xl md:text-4xl font-bold whitespace-pre-line drop-shadow-lg'>
            {t("title")}
          </h2>
          <p className='mt-2 text-sm md:text-lg drop-shadow-md'>
            {t("subtitle")}
          </p>
          <CommonButton asChild className='mt-4 w-32 md:w-40'>
            <Link
              href={{ pathname: "/", hash: "signup-section" }}
              aria-controls='signup-section'
            >
              {t("button")}
            </Link>
          </CommonButton>
        </Container>
      </div>
    </section>
  );
}
