"use client";

import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import Container from "../common/Container";
import { Link } from "@/i18n/navigation";
import { useArticles } from "@/hooks/useArticles";
import { sortByCreatedAtDesc } from "@/utils/articles";
import {
  ArticleRow,
  ArticleTableHeader,
} from "@/components/articles/ArticleTable";

const LIMIT = 5;

export default function ArticleSection() {
  const t = useTranslations("article");

  const { data: rows = [], isLoading } = useArticles();

  const items = sortByCreatedAtDesc(rows).slice(0, LIMIT);

  return (
    <section className='py-10'>
      <Container>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h2 className='text-xl md:text-2xl font-semibold'>
              {t("section.title")}
            </h2>
            <p className='text-sm text-muted-foreground'>{t("section.desc")}</p>
          </div>

          <Link
            href='/articles'
            className='hidden md:inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs
                       border border-border
                       text-foreground/70
                       hover:bg-accent hover:text-accent-foreground
                       transition-colors'
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
          <div className='rounded-md border border-border p-6 text-center text-sm text-muted-foreground'>
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
                          className='block hover:bg-accent hover:text-accent-foreground transition-colors'
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
            className='flex w-full max-w-xs items-center justify-center gap-1 rounded-md
                       border border-border
                       bg-card text-card-foreground
                       px-4 py-3 text-sm font-medium
                       hover:bg-accent hover:text-accent-foreground
                       transition-colors'
          >
            {t("section.button")}
            <ChevronRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
