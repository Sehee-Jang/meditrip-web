"use client";

import React from "react";
import { CATEGORY_LABELS_KO } from "@/constants/categories";
import { formatDateCompact } from "@/utils/date";
import type { Article } from "@/types/articles";
import ArticlesRowActions from "./ArticlesRowActions";

type Props = {
  article: Article;
  onEdit?: (wellnessId: string) => void;
  onDelete: (wellnessId: string) => void;
};

// 빈 값일 때 다른 로케일로 대체
function titleFallback(w: Article): string {
  return w.title.ko || w.title.ja || w.title.en || w.title.zh || "-";
}
export default function ArticlesTable({ article, onEdit, onDelete }: Props) {
  return (
    <tr>
      <td className='py-2'>
        <div className='truncate font-medium'>{titleFallback(article)}</div>
      </td>

      <td className='py-2 text-center'>
        {CATEGORY_LABELS_KO[article.category]}
      </td>

      <td className='py-2 text-center'>
        {formatDateCompact(article.createdAt)}
      </td>

      {/* 액션 */}
      <td
        className='px-4 py-3 pr-4 text-right'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='inline-flex items-center justify-end gap-2'>
          <ArticlesRowActions
            article={article}
            onEdit={() => onEdit?.(article.id)}
            onDelete={() => onDelete(article.id)}
          />
        </div>
      </td>
    </tr>
  );
}
