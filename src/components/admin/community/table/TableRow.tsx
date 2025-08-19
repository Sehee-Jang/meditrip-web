"use client";

import { useRouter } from "next/navigation";
import CommunityCategoryPill from "./CommunityCategoryPill";
import RowActions from "./RowActions";
import type { Question } from "@/types/question";
import type { CommunityCategoryKey } from "@/types/category";
import UserNameById from "@/components/common/UserNameById";
import { formatDateTimeCompact } from "@/utils/date";

export default function TableRow({ q }: { q: Question }) {
  const router = useRouter();

  return (
    <tr
      className='border-b hover:bg-slate-50 cursor-pointer'
      onClick={() => router.push(`/admin/community/${q.id}`)}
    >
      {/* 제목 */}
      <td className='px-4 py-3'>
        <div className='flex items-center gap-2'>
          <div className='line-clamp-2 font-medium'>{q.title}</div>
          {q.isHidden ? (
            <span className='inline-flex items-center rounded bg-slate-100 text-slate-600 h-5 px-2 text-[11px]'>
              숨김
            </span>
          ) : null}
        </div>
        <div className='text-xs text-muted-foreground mt-1 line-clamp-1'>
          {q.content}
        </div>
      </td>

      {/* 카테고리 */}
      <td className='px-4 py-3 text-center'>
        <CommunityCategoryPill category={q.category as CommunityCategoryKey} />
      </td>

      {/* 작성자명 */}
      <td className='px-4 py-3'>
        {q.userId ? (
          <span className='truncate'>
            <UserNameById userId={q.userId} fallbackName='익명' />
          </span>
        ) : null}
      </td>

      {/* 답변 여부: 숫자만 표시 */}
      <td className='px-4 py-3 text-center'>{q.answersCount ?? 0}</td>

      {/* 작성일 */}
      <td className='px-4 py-3'>{formatDateTimeCompact(q.createdAt)}</td>

      {/* 액션 */}
      <td
        className='px-4 py-3 text-center'
        onClick={(e) => e.stopPropagation()}
      >
        <RowActions questionId={q.id} />
      </td>
    </tr>
  );
}
