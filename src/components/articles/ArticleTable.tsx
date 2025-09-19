"use client";
import { titleFor, createdAtOf } from "@/utils/articles";
import type { Article } from "@/types/articles";
import type { ReactNode, ReactElement } from "react";
import { useLocale } from "next-intl";

export function ArticleTableHeader() {
  return (
    <div className='flex items-center border-b border-border px-4 py-2 text-xs text-muted-foreground bg-background'>
      <div className='w-12 text-center'>No.</div>
      <div className='flex-1 text-center'>글 제목</div>
      <div className='w-20 text-right'>조회수</div>
      <div className='w-28 text-right'>작성일</div>
    </div>
  );
}

export function ArticleRow({
  indexReverse,
  article,
  onClick,
  asLink,
}: {
  indexReverse: number;
  article: Article;
  onClick?: () => void;
  asLink?: (children: ReactNode) => ReactElement | ReactNode;
}) {
  const locale = useLocale() as keyof Article["title"];
  const title = titleFor(article, locale);
  const viewCount =
    typeof article.viewCount === "number" ? article.viewCount : 0;

  const createdAt = createdAtOf(article);

  const row = (
    <div
      className='flex w-full items-center gap-3 px-4 py-3 text-left transition-colors bg-background
                 hover:bg-accent hover:text-accent-foreground
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
    >
      <span className='w-12 text-center text-xs text-muted-foreground'>
        {indexReverse}
      </span>
      <span className='min-w-0 flex-1 truncate text-sm md:text-base text-foreground'>
        {title}
      </span>
      <span className='w-20 whitespace-nowrap text-right text-xs text-muted-foreground'>
        {viewCount.toLocaleString()}
      </span>
      <span className='w-28 whitespace-nowrap text-right text-xs text-muted-foreground'>
        {createdAt ? createdAt.toLocaleDateString() : ""}
      </span>
    </div>
  );

  if (asLink) return asLink(row);
  return (
    <button type='button' onClick={onClick} className='w-full text-left'>
      {row}
    </button>
  );
}
