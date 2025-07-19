"use client";

import { useTranslations } from "next-intl";
import { HelpCircle, Search, ThumbsUp } from "lucide-react";

const faqIcons = [HelpCircle, Search, ThumbsUp];

export default function FAQSection() {
  const t = useTranslations("FAQ");
  const items = t.raw("items") as Array<{ question: string; answer: string }>;

  return (
    <section className='px-4 md:px-[170px] py-8 md:py-[60px] bg-white'>
      <h2 className='text-xl md:text-2xl font-semibold mb-1'>{t("title")}</h2>
      <p className='text-sm text-gray-500 mb-4'>{t("description")}</p>

      <div className='divide-y borde-b rounded-md overflow-hidden bg-white'>
        {items.map((item, index) => {
          const Icon = faqIcons[index % faqIcons.length]; // 순환
          return (
            <div key={index} className='flex gap-3 px-4 py-3 items-start'>
              <Icon className='text-red-400 mt-1 shrink-0' size={20} />
              <div>
                <p className='text-sm font-semibold'>{item.question}</p>
                <p className='text-sm text-gray-500'>{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
