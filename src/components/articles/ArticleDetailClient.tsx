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
  const excerpt = data.excerpt?.[locale] || data.excerpt?.ko || "요약 없음";
  const body = data.body?.[locale];

  return (
    <article className='prose max-w-none dark:prose-invert'>
      <div className='text-center p-10'>
        <h1 className='mb-4 text-3xl font-bold'>{title}</h1>
        <h3 className=''> {excerpt}</h3>
      </div>

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
