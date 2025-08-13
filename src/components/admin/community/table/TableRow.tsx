"use client";

import { useRouter } from "next/navigation";
import { Image as ImageIcon, Minus } from "lucide-react";
import CommunityCategoryPill from "./CommunityCategoryPill";

import RowActions from "./RowActions";
import type { Question } from "@/types/question";
import type { CommunityCategoryKey } from "@/types/category";

export default function TableRow({
  q,
}: {
  q: Question;
}) {
  const router = useRouter();

  return (
    <tr
      className='border-b hover:bg-slate-50 cursor-pointer'
      onClick={() => router.push(`/admin/community/${q.id}`)}
    >
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

      <td className='px-4 py-3'>
        <CommunityCategoryPill category={q.category as CommunityCategoryKey} />
      </td>

      <td className='px-4 py-3 text-center'>
        {q.imageUrl ? (
          <ImageIcon className='inline-block size-4' />
        ) : (
          <Minus className='inline-block size-4 text-muted-foreground' />
        )}
      </td>

      {/* 숫자만 표시 */}
      <td className='px-4 py-3 text-center'>{q.answersCount}</td>

      <td className='px-4 py-3'>{new Date(q.createdAt).toLocaleString()}</td>

      <td
        className='px-4 py-3 text-center'
        onClick={(e) => e.stopPropagation()}
      >
        <RowActions questionId={q.id} />
      </td>
    </tr>
  );
}
