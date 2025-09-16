"use client";

import { useTranslations, useLocale } from "next-intl";
import { ChevronRight } from "lucide-react";
import Container from "../common/Container";
import { Link } from "@/i18n/navigation";
import { listArticles } from "@/services/articles/listArticles";
import type { Article } from "@/types/articles";
import { normalizeArticles } from "@/utils/articles";
import { useQuery } from "@tanstack/react-query";

const LIMIT = 5;

export default function ArticleSection() {
  const t = useTranslations("article");
  const locale = useLocale() as keyof Article["title"];

  const { data, isLoading } = useQuery({
    queryKey: ["articles-preview"],
    queryFn: async () => {
      const res = await listArticles();
      const all = normalizeArticles(res).filter((a) => !a.isHidden);
      // createdAt desc 정렬 후 상위 LIMIT
      const sorted = all.sort((a, b) => {
        const ad = (a as { createdAt?: string | number | Date })?.createdAt;
        const bd = (b as { createdAt?: string | number | Date })?.createdAt;
        const an = ad ? new Date(ad).getTime() : 0;
        const bn = bd ? new Date(bd).getTime() : 0;
        return bn - an;
      });
      return sorted.slice(0, LIMIT);
    },
    staleTime: 1000 * 60 * 3,
  });

  const items = data ?? [];

  return (
    <section className='bg-white py-10'>
      <Container>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h2 className='text-xl md:text-2xl font-semibold'>
              {t("section.title")}
            </h2>
            <p className='text-sm text-gray-500'>{t("section.desc")}</p>
          </div>

          <Link
            href='/articles'
            className='hidden md:inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs border border-gray-200 text-gray-600 hover:bg-gray-50'
          >
            {t("section.button")}
            <ChevronRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className='space-y-2'>
            {Array.from({ length: LIMIT }).map((_, i) => (
              <div
                key={i}
                className='h-12 animate-pulse rounded-lg border bg-gray-50'
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className='rounded-md border p-6 text-center text-sm text-muted-foreground'>
            아티클이 없습니다.
          </div>
        ) : (
          <div className='overflow-hidden'>
            <div className='flex items-center border-b px-4 py-2 text-xs text-gray-500'>
              <div className='w-12 text-center'>No.</div>
              <div className='flex-1 text-center'>글 제목</div>
              <div className='w-20 text-right'>조회수</div>
              <div className='w-28 text-right'>작성일</div>
            </div>
            <ul role='list' className='divide-y'>
              {items.map((a, i) => {
                const no = items.length - i;
                const title = a.title?.[locale] || a.title?.ko || "제목 없음";
                const views = (a as { views?: number })?.views ?? 0;
                const createdAtRaw = (
                  a as { createdAt?: string | number | Date }
                )?.createdAt;
                const createdAt = createdAtRaw ? new Date(createdAtRaw) : null;

                return (
                  <li key={a.id}>
                    <Link
                      href={`/articles?id=${encodeURIComponent(a.id)}#detail`}
                      className='flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10'
                    >
                      <span className='w-12 text-center text-xs text-gray-500'>
                        {no}
                      </span>
                      <span className='flex-1 min-w-0 truncate text-sm md:text-base text-gray-900'>
                        {title}
                      </span>
                      <span className='w-20 text-right text-xs text-gray-500 whitespace-nowrap'>
                        {views.toLocaleString()}
                      </span>
                      <span className='w-28 text-right text-xs text-gray-500 whitespace-nowrap'>
                        {createdAt ? createdAt.toLocaleDateString() : ""}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className='md:hidden mt-6 flex justify-center'>
          <Link
            href='/articles'
            className='w-full max-w-xs bg-white text-black border flex items-center justify-center gap-1 text-sm font-medium px-4 py-3 rounded-md'
          >
            {t("section.button")}
            <ChevronRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
