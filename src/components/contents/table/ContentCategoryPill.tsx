"use client";

import {
  CATEGORY_ICONS,
  CATEGORY_LABELS_KO,
  type CategoryKey,
} from "@/constants/categories";

export default function ContentCategoryPill({
  category,
}: {
  category: CategoryKey;
}) {
  const label = CATEGORY_LABELS_KO[category];
  const Icon = CATEGORY_ICONS[category];
  return (
    <span className='inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-xs'>
      <Icon className='size-3.5' />
      <span className='font-medium'>{label}</span>
    </span>
  );
}
