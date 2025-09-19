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
      className={[
        "group block overflow-hidden rounded-2xl border border-border bg-background",
        "transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
      ].join(" ")}
    >
      {thumb ? (
        <div className='relative aspect-[16/9] w-full bg-gray-100'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt=''
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
            loading='lazy'
          />
        </div>
      ) : (
        <div className='aspect-[16/9] w-full bg-gray-50' />
      )}

      <div className='space-y-1 p-3'>
        <h3 className='line-clamp-2 text-sm font-semibold tracking-tight md:text-base text-foreground'>
          {title}
        </h3>
        {excerpt ? (
          <p className='line-clamp-2 text-xs md:text-sm text-muted-foreground'>
            {excerpt}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
