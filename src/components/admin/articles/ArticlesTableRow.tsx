"use client";

import React from "react";
import { CATEGORY_LABELS_KO } from "@/constants/categories";
import { formatDateCompact } from "@/utils/date";
import type { Article, ArticleStatus } from "@/types/articles";
import ArticlesRowActions from "./ArticlesRowActions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateArticleStatus } from "@/services/articles/updateArticleStatus";

type Props = {
  article: Article;
  onUpdated?: () => void;
  onEdit?: (wellnessId: string) => void;
  onDelete: (wellnessId: string) => void;
};

// 빈 값일 때 다른 로케일로 대체
function titleFallback(w: Article): string {
  return w.title.ko || w.title.ja || w.title.en || w.title.zh || "-";
}
export default function ArticlesTableRow({
  article,
  onUpdated,
  onEdit,
  onDelete,
}: Props) {
  const [updating, setUpdating] = React.useState(false);

  const handleChangeStatus = async (next: ArticleStatus) => {
    if (next === article.status) return;
    try {
      setUpdating(true);
      await updateArticleStatus(article.id, next);
      onUpdated?.();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <tr>
      {/* 제목 */}
      <td className='px-4 py-2'>
        <div className='truncate font-medium'>{titleFallback(article)}</div>
      </td>

      {/* 카테고리 */}
      <td className='py-2 text-center'>
        {CATEGORY_LABELS_KO[article.category]}
      </td>

      {/* 등록일 */}
      <td className='py-2 text-center'>
        {formatDateCompact(article.createdAt)}
      </td>

      <td className='px-4 py-3 text-center'>
        <Select
          value={article.status}
          onValueChange={(v) => handleChangeStatus(v as ArticleStatus)}
          disabled={updating}
        >
          <SelectTrigger className='w-[120px]'>
            <SelectValue placeholder='상태' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='visible'>노출</SelectItem>
            <SelectItem value='hidden'>숨김</SelectItem>
          </SelectContent>
        </Select>
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
