"use client";

import { useTranslations, useLocale } from "next-intl";
import { ChevronRight } from "lucide-react";
import Container from "../common/Container";
import { Link } from "@/i18n/navigation";
import type { Article } from "@/types/articles";
import { useArticles } from "@/hooks/useArticles";
import { sortByCreatedAtDesc } from "@/utils/articles";
import {
  ArticleRow,
  ArticleTableHeader,
} from "@/components/articles/ArticleTable";

const LIMIT = 5;

export default function ArticleSection() {
  const t = useTranslations("article");
  const locale = useLocale() as keyof Article["title"];

  const { data: rows = [], isLoading } = useArticles();

  const items = sortByCreatedAtDesc(rows).slice(0, LIMIT);

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
            <ArticleTableHeader />
            <ul role='list' className='divide-y'>
              {items.map((a, i) => {
                const no = items.length - i;
                return (
                  <li key={a.id}>
                    <ArticleRow
                      indexReverse={no}
                      article={a}
                      asLink={(children) => (
                        <Link
                          href={`/articles?id=${encodeURIComponent(
                            a.id
                          )}#detail`}
                          className='block'
                        >
                          {children}
                        </Link>
                      )}
                    />
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
