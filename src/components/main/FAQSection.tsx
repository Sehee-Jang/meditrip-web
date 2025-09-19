"use client";

import { useTranslations } from "next-intl";
import { HelpCircle, Search, ThumbsUp } from "lucide-react";
import Container from "../common/Container";
import { Link } from "@/i18n/navigation";

const faqIcons = [HelpCircle, Search, ThumbsUp];

export default function FAQSection() {
  const t = useTranslations("faq-section");
  const items = t.raw("items") as Array<{ question: string; answer: string }>;

  return (
    <section className='py-10'>
      <Container>
        <h2 className='text-xl md:text-2xl font-semibold mb-1'>{t("title")}</h2>
        <p className='text-sm text-muted-foreground mb-4'>{t("description")}</p>

        <div>
          <Link
            href={`/faq`}
            className='divide-y borde-b rounded-md overflow-hidde'
          >
            {items.map((item, index) => {
              const Icon = faqIcons[index % faqIcons.length]; // 순환
              return (
                <div key={index} className='flex gap-3 px-4 py-3 items-start'>
                  <Icon className='text-red-400 mt-1 shrink-0' size={20} />
                  <div>
                    <p className='text-sm font-semibold'>{item.question}</p>
                    <p className='text-sm text-muted-foreground'>
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </Link>
        </div>
      </Container>
    </section>
  );
}
