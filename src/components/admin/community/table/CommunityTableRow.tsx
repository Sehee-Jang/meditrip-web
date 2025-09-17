"use client";

import { useRouter } from "next/navigation";
import CommunityCategoryPill from "./CommunityCategoryPill";
import RowActions from "./CommunityRowActions";
import type { Question } from "@/types/question";
import type { CategoryKey } from "@/constants/categories";
import UserNameById from "@/components/common/UserNameById";
import { formatDateTimeCompact } from "@/utils/date";

export default function CommunityTableRow({ q }: { q: Question }) {
  const router = useRouter();

  return (
    <tr
      className='cursor-pointer border-t hover:bg-muted/20'
      onClick={() => router.push(`/admin/community/${q.id}`)}
    >
      {/* 제목, 내용, 숨김여부*/}
      <td className='px-4 py-3'>
        <div className='flex items-center gap-2'>
          <div className='line-clamp-2 font-medium'>{q.title}</div>
          {q.isHidden ? (
            <span className='inline-flex h-5 items-center rounded bg-slate-100 px-2 text-[11px] text-slate-600'>
              숨김
            </span>
          ) : null}
        </div>
        <div className='mt-1 line-clamp-1 text-xs text-muted-foreground'>
          {q.content}
        </div>
      </td>

      {/* 카테고리 */}
      <td className='px-4 py-3 text-center'>
        <CommunityCategoryPill category={q.category as CategoryKey} />
      </td>

      {/* 작성자명 */}
      <td className='px-4 py-3'>
        {q.userId ? (
          <span className='block truncate'>
            <UserNameById userId={q.userId} fallbackName='익명' />
          </span>
        ) : null}
      </td>

      {/* 답변 여부: 숫자만 표시 */}
      <td className='px-4 py-3 text-right tabular-nums pr-6'>
        {q.answersCount ?? 0}
      </td>

      {/* 작성일 */}
      <td className='px-4 py-3 text-center'>
        {formatDateTimeCompact(q.createdAt)}
      </td>

      {/* 더 보기 */}
      <td
        className='px-4 py-3 text-right pr-4'
        onClick={(e) => e.stopPropagation()}
      >
        <RowActions questionId={q.id} />
      </td>
    </tr>
  );
}
