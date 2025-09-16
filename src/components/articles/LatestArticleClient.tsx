"use client";

import { useEffect, useMemo, useState } from "react";
import { listArticles } from "@/services/articles/listArticles";
import { normalizeArticles } from "@/utils/articles";
import type { Article } from "@/types/articles";
import ArticleDetailClient from "./ArticleDetailClient";

/** 목록 아래에 최신글 전체 본문을 그대로 붙여 보여주는 컴포넌트 */
export default function LatestArticleClient() {
  const [all, setAll] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await listArticles();
        const rows = normalizeArticles(res);
        if (!alive) return;
        setAll(rows.filter((r) => !r.isHidden));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // createdAt 기준 최신 1개
  const latest = useMemo(() => {
    if (all.length === 0) return null;
    const sorted = [...all].sort((a, b) => {
      const ad = (a as { createdAt?: string | number | Date })?.createdAt;
      const bd = (b as { createdAt?: string | number | Date })?.createdAt;
      const an = ad ? new Date(ad).getTime() : 0;
      const bn = bd ? new Date(bd).getTime() : 0;
      return bn - an; // desc
    });
    return sorted[0] ?? null;
  }, [all]);

  if (loading) {
    return <div className='h-40 animate-pulse rounded-2xl border bg-gray-50' />;
  }
  if (!latest) return null;

  // 최신글의 id로 상세 렌더러 호출 → 본문 전체가 페이지 내에 바로 노출
  return (
    <section className='mt-10'>
      <ArticleDetailClient id={latest.id} />
    </section>
  );
}
