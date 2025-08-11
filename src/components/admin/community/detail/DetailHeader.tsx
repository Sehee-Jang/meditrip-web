"use client";

import { Badge } from "@/components/ui/badge";
import {
  COMMUNITY_CATEGORY_ICONS,
  COMMUNITY_CATEGORY_LABELS,
} from "@/constants/communityCategories";
import type { CommunityCategoryKey } from "@/types/category";
import type { Question } from "@/types/question";

export default function DetailHeader({ question }: { question: Question }) {
 const key = (question.category as CommunityCategoryKey) ?? "etc";
  const Icon =
    COMMUNITY_CATEGORY_ICONS[question.category as CommunityCategoryKey];
 const label = COMMUNITY_CATEGORY_LABELS[key] ?? COMMUNITY_CATEGORY_LABELS.etc;

  return (
    <div>
      <div className='flex items-center gap-2'>
        <span className='inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-xs'>
          <Icon className='size-3.5' />
          <span className='font-medium'>{label}</span>
        </span>
        <Badge variant='secondary'>
          {new Date(question.createdAt).toLocaleString()}
        </Badge>
      </div>
      <h2 className='mt-2 text-xl font-semibold'>{question.title}</h2>
    </div>
  );
}
