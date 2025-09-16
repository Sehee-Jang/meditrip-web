"use client";

import { useLocale } from "next-intl";
import type { LocaleKey } from "@/constants/locales";
import { getArticleById } from "@/services/articles/getArticleById";
import { incrementView } from "@/services/articles/incrementView";
import RichTextViewer from "./RichTextViewer";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function ArticleDetailClient({ id }: { id: string }) {
  const locale = useLocale() as LocaleKey;

  const { data, isLoading } = useQuery({
    queryKey: ["article", id],
    queryFn: () => getArticleById(id),
    staleTime: 1000 * 60 * 3, // 3분
  });

  // 조회수 증가(실패 무시)
  useEffect(() => {
    if (!id) return;
    void incrementView(id).catch(() => {});
  }, [id]);

  if (isLoading) {
    return <div className='h-40 animate-pulse rounded-md border bg-gray-50' />;
  }
  if (!data) {
    return (
      <div className='rounded-md border p-6 text-center text-sm text-muted-foreground'>
        아티클을 찾을 수 없습니다.
      </div>
    );
  }

  const title = data.title?.[locale] || data.title?.ko || "제목 없음";
  const excerpt = data.excerpt?.[locale] || data.excerpt?.ko || "";
  const body = data.body?.[locale];
  const createdAtRaw = (data as { createdAt?: string | number | Date })
    ?.createdAt;
  const createdAt = createdAtRaw ? new Date(createdAtRaw) : null;

  return (
    <article className='article-content prose max-w-none dark:prose-invert'>
      <header className='mb-6 text-center p-10 border-b'>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-gray-900'>
          {title}
        </h1>
        {excerpt ? (
          <p className='mt-2 text-gray-600 text-sm md:text-base'>{excerpt}</p>
        ) : null}
        <div className='mt-3 text-xs text-gray-500'>
          {createdAt ? createdAt.toLocaleDateString() : ""}
        </div>
      </header>

      {data.images?.[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.images[0]}
          alt=''
          className='mb-6 w-full rounded-md border object-cover'
        />
      ) : null}

      {body ? <RichTextViewer doc={body} /> : <p>본문이 없습니다.</p>}
    </article>
  );
}
