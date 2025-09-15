"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ChevronRight } from "lucide-react";
import Container from "../common/Container";
import { Link } from "@/i18n/navigation";
import { listArticles } from "@/services/articles/listArticles";
import type { Article } from "@/types/articles";
import { normalizeArticles } from "@/utils/articles";
import ArticleCard from "../articles/ArticleCard";

export default function ArticleSection() {
  const t = useTranslations("article");

  const locale = useLocale() as keyof Article["title"];
  const [rows, setRows] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await listArticles();
        const all = normalizeArticles(res);
        if (!alive) return;
        setRows(all.filter((a) => !a.isHidden).slice(0, 3));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

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

          {/* 데스크탑 CTA */}
          <Link
            href='/community'
            className='hidden md:flex items-center gap-1 bg-white text-black border text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 hover:border-gray-300 transition'
          >
            {t("section.button")}
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* 아티클 리스트 */}
        {/* 리스트 */}
        {loading ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='h-40 animate-pulse rounded-md border bg-gray-50'
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className='rounded-md border p-6 text-center text-sm text-muted-foreground'>
            아티클이 없습니다.
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            {rows.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} />
            ))}
          </div>
        )}
        {/* 모바일: 질문올리기 버튼 */}
        <div className='md:hidden mt-6 flex justify-center'>
          <Link
            href='/community'
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
