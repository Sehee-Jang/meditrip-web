"use client";

import {
  Brain,
  Salad,
  ShieldCheck,
  Stethoscope,
  Hourglass,
} from "lucide-react";
import { useTranslations } from "next-intl";

const categories = [
  { id: 1, icon: Brain, key: "stress" },
  { id: 2, icon: Salad, key: "diet" },
  { id: 3, icon: ShieldCheck, key: "immunity" },
  { id: 4, icon: Stethoscope, key: "women" },
  { id: 5, icon: Hourglass, key: "antiaging" },
];

export default function CategorySection() {
  const t = useTranslations("Categories");
  return (
    <section className='px-4 py-4 md:px-[170px] md:py-[60px]'>
      <div className='grid grid-cols-5 gap-2 sm:gap-3 md:gap-4'>
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className='h-[88px] flex flex-col items-center justify-center border border-gray-200 rounded-md bg-white'
            >
              <Icon size={24} className='mb-1 text-gray-700' />
              <span className='text-xs font-medium'>{t(cat.key)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
