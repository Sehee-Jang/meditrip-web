"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { COMMUNITY_CATEGORY_ICONS } from "@/constants/communityCategories";
import type { CommunityCategoryKey } from "@/types/category";
import type { Question } from "@/types/question";

export default function DetailHeader({ question }: { question: Question }) {
  const t = useTranslations("question-form");
  const Icon =
    COMMUNITY_CATEGORY_ICONS[question.category as CommunityCategoryKey];

  return (
    <div>
      <div className='flex items-center gap-2'>
        <span className='inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-xs'>
          <Icon className='size-3.5' />
          <span className='font-medium'>
            {" "}
            {t(`form.category.options.${question.category}`)}
          </span>
        </span>
        <Badge variant='secondary'>
          {new Date(question.createdAt).toLocaleString()}
        </Badge>
      </div>
      <h2 className='mt-2 text-xl font-semibold'>{question.title}</h2>
    </div>
  );
}
