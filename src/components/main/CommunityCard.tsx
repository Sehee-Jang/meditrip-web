"use client";

import { Link } from "@/i18n/navigation";
import CardThumb from "@/components/common/CardThumb";
import UserChip from "@/components/common/UserChip";

export type CommunityCardQuestion = {
  id: string;
  title: string;
  imageUrl?: string | null;
  userId?: string | null;
  user?: { id?: string | null; nickname?: string | null } | null;
};

type Props = {
  question: CommunityCardQuestion;
  alt: string; // 이미지 대체텍스트(i18n)
  anonymousLabel: string; // 익명 표시(i18n)
};

function getUserId(q: CommunityCardQuestion): string {
  return q.userId ?? q.user?.id ?? "";
}

function getDisplayName(
  q: CommunityCardQuestion,
  anonymousLabel: string
): string {
  return q.user?.nickname ?? anonymousLabel;
}

export default function CommunityCard({
  question: q,
  alt,
  anonymousLabel,
}: Props) {
  const userId = getUserId(q);
  const fallbackName = getDisplayName(q, anonymousLabel);

  return (
    <Link
      href={`/community/questions/${q.id}`}
      className='overflow-hidden rounded-lg border bg-gray-50 shadow-sm transition hover:bg-gray-100'
    >
      <div className='relative h-32 w-full sm:h-40'>
        <CardThumb src={q.imageUrl} alt={alt} />
      </div>

      <div className='p-4'>
        <h3 className='line-clamp-2 text-sm font-semibold'>{q.title}</h3>
        <div className='mt-2 text-xs text-gray-500'>
          <div className='flex items-center gap-2'>
            <UserChip userId={userId} fallbackName={fallbackName} size={24} />
          </div>
        </div>
      </div>
    </Link>
  );
}
