"use client";

import { useRouter } from "next/navigation";
import { Image as ImageIcon, Minus } from "lucide-react";
import type { Video } from "@/types/video";
import ContentCategoryPill from "./ContentCategoryPill";
import RowActions from "./RowActions";

export default function TableRow({
  v,
  onDeleted,
}: {
  v: Video;
  onDeleted: () => void;
}) {
  const router = useRouter();

  return (
    <tr
      className='border-b hover:bg-slate-50 cursor-pointer'
      onClick={() => router.push(`/admin/shorts/${v.id}`)}
    >
      {/* 제목 + (옵션) 상태 뱃지 자리 */}
      <td className='px-4 py-3'>
        <div className='line-clamp-2 font-medium'>{v.title}</div>
        <div className='text-xs text-muted-foreground mt-1 line-clamp-1'>
          {v.youtubeUrl}
        </div>
      </td>

      {/* 카테고리 */}
      <td className='px-4 py-3'>
        <ContentCategoryPill category={v.category} />
      </td>

      {/* 썸네일 존재 여부 아이콘 */}
      <td className='px-4 py-3 text-center'>
        {v.thumbnailUrl ? (
          <ImageIcon className='inline-block size-4' />
        ) : (
          <Minus className='inline-block size-4 text-muted-foreground' />
        )}
      </td>

      {/* 조회수(숫자만) */}
      <td className='px-4 py-3 text-center'>{v.viewCount ?? 0}</td>

      {/* 등록일 */}
      <td className='px-4 py-3'>
        {v.createdAt ? new Date(v.createdAt).toLocaleString() : "-"}
      </td>

      {/* 작업 */}
      <td
        className='px-4 py-3 text-center'
        onClick={(e) => e.stopPropagation()}
      >
        <RowActions videoId={v.id} onDeleted={onDeleted} />
      </td>
    </tr>
  );
}
