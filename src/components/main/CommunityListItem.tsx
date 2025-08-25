"use client";

import { Link } from "@/i18n/navigation";
import UserChip from "@/components/common/UserChip";
import { ChevronRight, MessageSquare } from "lucide-react";
import { formatDateCompact, type DateInput } from "@/utils/date";

export type CommunityListItemQuestion = {
  id: string;
  title: string;
  userId?: string | null;
  createdAt?: DateInput;
  answersCount?: number;
};

type Props = {
  question: CommunityListItemQuestion;
  anonymousLabel: string;
};

export default function CommunityListItem({ question, anonymousLabel }: Props) {
  const { id, title, userId, createdAt, answersCount } = question;

  const fallbackName = userId ? undefined : anonymousLabel;
  const createdText = createdAt ? formatDateCompact(createdAt) : null;
  const answerNum =
    typeof answersCount === "number" &&
    Number.isFinite(answersCount) &&
    answersCount > 0
      ? answersCount
      : null;

  return (
    <li>
      <Link
        href={`/community/questions/${id}`}
        className='group flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-gray-50 transition'
      >
        {/* 앞쪽 아이콘 */}
        <MessageSquare
          size={18}
          className='shrink-0 text-gray-400 group-hover:text-gray-600 transition'
          aria-hidden
        />

        {/* 본문 */}
        <div className='min-w-0 flex-1'>
          <p className='truncate text-[15px] font-medium text-gray-900'>
            {title}
          </p>

          <div className='mt-1 flex items-center gap-3 text-[12px] text-gray-600'>
            <UserChip
              userId={userId ?? ""}
              fallbackName={fallbackName}
              size={18}
            />
            {createdText && <span className='shrink-0'>{createdText}</span>}
            {answerNum !== null && (
              <span className='shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] leading-5'>
                {answerNum}
              </span>
            )}
          </div>
        </div>

        {/* 오른쪽 화살표 */}
        <ChevronRight
          size={16}
          className='shrink-0 text-gray-400 group-hover:text-gray-600 transition'
          aria-hidden
        />
      </Link>
    </li>
  );
}
