"use client";

import Image from "next/image";
import ContentCategoryPill from "@/components/shorts/table/ContentCategoryPill";
import type { Video } from "@/types/video";
import { formatDateTimeCompact } from "@/utils/date";
import { useState } from "react";
import VideoRowActions from "./VideoRowActions";

const FALLBACK_THUMB = "/images/placeholders/community_default_img.webp";

function Thumb({ src, alt }: { src: string; alt: string }) {
  const [s, setS] = useState(src);
  return (
    <div className='relative h-12 w-20'>
      <Image
        src={s}
        alt={alt}
        fill
        sizes='80px'
        className='rounded-md object-cover'
        onError={() => setS(FALLBACK_THUMB)}
      />
    </div>
  );
}

export default function VideoTableRow({
  v,
  onDelete,
}: {
  v: Video;
  onDelete: (id: string) => void | Promise<void>;
}) {
  return (
    <tr className='border-t hover:bg-muted/20'>
      {/* 썸네일 */}
      <td className='px-4 py-3 text-center'>
        {v.thumbnailUrl ? (
          <Thumb src={v.thumbnailUrl} alt={v.title} />
        ) : (
          <div className='h-12 w-20 rounded-md bg-slate-100' />
        )}
      </td>

      {/* 제목: 좌측, 두 줄 클램프 */}
      <td className='px-4 py-3'>
        <div className='line-clamp-2 font-medium'>{v.title}</div>
      </td>

      {/* 카테고리 */}
      <td className='px-4 py-3 text-center'>
        <ContentCategoryPill category={v.category} />
      </td>

      {/* 등록일 */}
      <td className='px-4 py-3 text-center'>
        {formatDateTimeCompact(v.createdAt)}
      </td>

      {/* 액션 */}
      <td
        className='px-4 py-3 pr-4 text-right'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='inline-flex items-center justify-end gap-2'>
          <VideoRowActions video={v} onDelete={onDelete} />
        </div>
      </td>
    </tr>
  );
}
