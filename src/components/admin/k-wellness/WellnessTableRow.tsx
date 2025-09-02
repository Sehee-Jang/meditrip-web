"use client";

import React from "react";
import { CATEGORY_LABELS_KO } from "@/constants/categories";
import { formatDateCompact } from "@/utils/date";
import type { Wellness } from "@/types/wellness";
import WellnessRowActions from "./WellnessRowActions";

type Props = {
  wellness: Wellness;
  onEdit?: (wellnessId: string) => void;
  onDelete: (wellnessId: string) => void;
};

// 빈 값일 때 다른 로케일로 대체
function titleFallback(w: Wellness): string {
  return w.title.ko || w.title.ja || w.title.en || w.title.zh || "-";
}
export default function WellnessTableRow({
  wellness,
  onEdit,
  onDelete,
}: Props) {
  return (
    <tr>
      <td className='py-2'>
        <div className='truncate font-medium'>{titleFallback(wellness)}</div>
      </td>

      <td className='py-2 text-center'>
        {CATEGORY_LABELS_KO[wellness.category]}
      </td>

      <td className='py-2 text-center'>
        {formatDateCompact(wellness.createdAt)}
      </td>

      {/* 액션 */}
      <td
        className='px-4 py-3 pr-4 text-right'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='inline-flex items-center justify-end gap-2'>
          <WellnessRowActions
            wellness={wellness}
            onEdit={() => onEdit?.(wellness.id)}
            onDelete={() => onDelete(wellness.id)}
          />
        </div>
      </td>
    </tr>
  );
}
