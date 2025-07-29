"use client";

import { useTranslations } from "next-intl";
import Container from "../common/Container";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  CategoryKey,
} from "@/constants/categories";

const categoryKeys: CategoryKey[] = Object.keys(CATEGORIES) as CategoryKey[];

export default function CategorySection() {
  const t = useTranslations("categories");
  return (
    <section className='md:y-10 bg-white'>
      <Container className='px-0 md:px-6'>
        <div className='grid grid-cols-5 gap-2 sm:gap-3 md:gap-4'>
          {categoryKeys.map((key) => {
            const Icon = CATEGORY_ICONS[key];
            return (
              <div
                key={key}
                className='h-[88px] flex flex-col items-center justify-center border border-gray-200 rounded-md bg-white'
              >
                <Icon size={24} className='mb-1 text-gray-700' />
                <span className='text-xs font-medium'>{t(key)}</span>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
