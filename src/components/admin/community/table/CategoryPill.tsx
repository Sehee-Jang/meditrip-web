"use client";

import { useTranslations } from "next-intl";
import { COMMUNITY_CATEGORY_ICONS } from "@/constants/communityCategories";
import type { CommunityCategoryKey } from "@/types/category";

export default function CategoryPill({
  category,
}: {
  category: CommunityCategoryKey;
}) {
  const t = useTranslations("question-form");
  const Icon = COMMUNITY_CATEGORY_ICONS[category];
  return (
    <span className='inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-xs'>
      <Icon className='size-3.5' />
      <span className='font-medium'>
        {t(`form.category.options.${category}`)}
      </span>
    </span>
  );
}
