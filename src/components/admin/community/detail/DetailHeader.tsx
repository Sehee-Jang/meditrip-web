"use client";

import type { Question } from "@/types/question";
import { formatDateTimeCompact } from "@/utils/date";

export default function DetailHeader({ question }: { question: Question }) {
  const createdAtText = formatDateTimeCompact(question.createdAt);

  return (
    <div className='flex flex-col gap-1 min-w-0'>
      <div className='flex items-center gap-2 flex-wrap'>
        {/* 카테고리 */}
        {typeof question.category === "string" &&
          question.category.length > 0 && (
            <span className='inline-flex items-center rounded bg-slate-100 text-slate-700 h-6 px-2 text-xs'>
              {question.category}
            </span>
          )}

        {/* 노출 상태 */}
        <span
          className={`inline-flex items-center rounded h-6 px-2 text-xs ${
            question.isHidden
              ? "bg-rose-50 text-rose-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {question.isHidden ? "숨김" : "노출"}
        </span>

        {/* 답변 여부 */}
        <span
          className={`inline-flex items-center rounded h-6 px-2 text-xs ${
            (question.answersCount ?? 0) > 0
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {(question.answersCount ?? 0) > 0 ? "답변완료" : "미답변"}
        </span>

        <span className='text-xs text-muted-foreground'>
          ({question.answersCount ?? 0})
        </span>
      </div>

      {/* 작성일 */}
      <div className='text-xs text-muted-foreground'>{createdAtText}</div>
    </div>
  );
}
