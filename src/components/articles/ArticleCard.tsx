"use client";

import { Link } from "@/i18n/navigation";
import type { Article } from "@/types/articles";
import type { LocaleKey } from "@/constants/locales";

export default function ArticleCard({
  article,
  locale,
}: {
  article: Article;
  locale: LocaleKey;
}) {
  const title = article.title?.[locale] || article.title?.ko || "제목 없음";
  const excerpt = article.excerpt?.[locale] || article.excerpt?.ko || "";
  const thumb = (article.images?.[0] as string | undefined) ?? "";

  return (
    <Link
      href={`/articles/${article.id}`}
      className='group block overflow-hidden rounded-lg border bg-white transition hover:shadow-sm'
    >
      {thumb ? (
        <div className='relative aspect-[16/9] w-full bg-gray-100'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt='' className='h-full w-full object-cover' />
        </div>
      ) : (
        <div className='aspect-[16/9] w-full bg-gray-50' />
      )}

      <div className='space-y-1 p-3'>
        <h3 className='line-clamp-2 text-sm font-semibold md:text-base'>
          {title}
        </h3>
        {excerpt ? (
          <p className='line-clamp-2 text-xs text-muted-foreground'>
            {excerpt}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
