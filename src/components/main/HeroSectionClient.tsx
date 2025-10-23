"use client";

import { useRef, type FC } from "react";
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
import { Link } from "@/i18n/navigation";

interface Props {
  images: string[]; // 예: ['/images/hero/hero1.webp', ...]
}

const HERO_IMAGE_SIZES =
  "(min-width: 1600px) 1600px, (min-width: 1024px) 1024px, (min-width: 768px) 768px, 100vw";

const HeroSectionClient: FC<Props> = ({ images }) => {
  const t = useTranslations("hero-section");

  const autoplay = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const hasImages = images.length > 0;
  const slides = hasImages ? images : ["/images/hero/hero1.webp"];

  return (
    <section className='relative w-full h-[360px] md:h-[480px] mb-6'>
      <Carousel opts={{ loop: true }} plugins={[autoplay.current]}>
        <CarouselContent>
          {slides.map((src, idx) => (
            <CarouselItem key={src}>
              <div className='relative w-full h-[360px] md:h-[480px]'>
                <Image
                  src={src}
                  alt={`메인 슬라이드 ${idx + 1}`}
                  fill
                  sizes={HERO_IMAGE_SIZES}
                  className='object-cover object-center'
                  priority={idx === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className='absolute inset-0 flex items-center justify-center'>
        <Container className='!pb-0 text-center text-white px-4'>
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
};

export default HeroSectionClient;
