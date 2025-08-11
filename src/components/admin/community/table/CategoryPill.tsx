"use client";

import {
  COMMUNITY_CATEGORY_ICONS,
  COMMUNITY_CATEGORY_LABELS,
} from "@/constants/communityCategories";
import type { CommunityCategoryKey } from "@/types/category";

export default function CategoryPill({
  category,
}: {
  category: CommunityCategoryKey;
}) {
  const label = COMMUNITY_CATEGORY_LABELS[category];
  const Icon = COMMUNITY_CATEGORY_ICONS[category];
  return (
    <span className='inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-xs'>
      <Icon className='size-3.5' />
      <span className='font-medium'>{label}</span>
    </span>
  );
}
