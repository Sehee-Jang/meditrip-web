"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import type { LocaleKey } from "@/constants/locales";
import type { Article } from "@/types/articles";
import { getArticleById } from "@/services/articles/getArticleById";
import { incrementView } from "@/services/articles/incrementView";
import RichTextViewer from "./RichTextViewer";

export default function ArticleDetailClient({ id }: { id: string }) {
  const locale = useLocale() as LocaleKey;
  const [data, setData] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const doc = await getArticleById(id);
        if (!alive) return;
        setData(doc);
        // 조회수 증가 (실패해도 무시)
        try {
          await incrementView(id);
        } catch {}
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
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
      {/* 헤더: 중앙 정렬 · 날짜/구분선 */}
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
