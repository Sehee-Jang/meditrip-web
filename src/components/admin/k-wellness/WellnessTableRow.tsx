"use client";

import React from "react";
import { CATEGORY_LABELS_KO } from "@/constants/categories";
import { formatDateCompact } from "@/utils/date";
import type { Wellness } from "@/types/wellness";

import { toast } from "sonner";
import { deleteWellness } from "@/services/wellness/deleteWellness";

type Props = {
  v: Wellness;
  onEdit?: () => void;
  onChanged?: () => void;
};

export default function WellnessTableRow({ v, onEdit, onChanged }: Props) {
  const handleDelete = async () => {
    const ok = confirm("정말 삭제할까요?");
    if (!ok) return;
    try {
      await deleteWellness(v.id);
      toast.success("삭제되었습니다.");
      onChanged?.();
    } catch {
      toast.error("삭제에 실패했어요.");
    }
  };

  return (
    <tr>
      <td className='py-2'>
        <div className='truncate font-medium'>{v.title}</div>
      </td>
      <td className='py-2 text-center'>{CATEGORY_LABELS_KO[v.category]}</td>
      <td className='py-2 text-center'>{formatDateCompact(v.createdAt)}</td>
      <td className='py-2 text-right'>
        <div className='inline-flex gap-2'>
          <button
            type='button'
            className='rounded border px-2 py-1 text-sm hover:bg-gray-50'
            onClick={onEdit}
          >
            수정
          </button>
          <button
            type='button'
            className='rounded border px-2 py-1 text-sm text-red-600 hover:bg-red-50'
            onClick={() => void handleDelete()}
          >
            삭제
          </button>
        </div>
      </td>
    </tr>
  );
}
