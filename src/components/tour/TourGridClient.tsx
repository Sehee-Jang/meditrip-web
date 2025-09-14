"use client";

import * as React from "react";
import type {
  WellnessListItem,
  Mode,
  WellnessListApiResponse,
} from "@/types/kto-wellness";
import TourCard from "@/components/tour/TourCard";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";

type Filters = {
  mode: Mode;
  lDongRegnCd?: string;
  lDongSignguCd?: string;
  wellnessThemaCd?: string;
  keyword?: string | undefined;
  mapX?: number | undefined;
  mapY?: number | undefined;
  radius?: number | undefined;
};

type Props = {
  lang: "ko" | "ja";
  initialItems: WellnessListItem[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
  filters: Filters;
};

function buildApiUrl({
  lang,
  pageNo,
  numOfRows,
  filters,
}: {
  lang: "ko" | "ja";
  pageNo: number;
  numOfRows: number;
  filters: Filters;
}) {
  const p = new URLSearchParams();
  p.set("lang", lang);
  p.set("mode", filters.mode);
  p.set("pageNo", String(pageNo));
  p.set("numOfRows", String(numOfRows));
  // ✅ location 모드면 거리순(E), 그 외 C
  p.set("arrange", filters.mode === "location" ? "E" : "C");
  p.set("withDetail", "1");

  if (filters.lDongRegnCd) p.set("lDongRegnCd", filters.lDongRegnCd);
  if (filters.lDongSignguCd) p.set("lDongSignguCd", filters.lDongSignguCd);
  if (filters.wellnessThemaCd)
    p.set("wellnessThemaCd", filters.wellnessThemaCd);
  if (filters.keyword) p.set("keyword", filters.keyword);
  if (filters.mode === "location") {
    if (typeof filters.mapX === "number") p.set("mapX", String(filters.mapX));
    if (typeof filters.mapY === "number") p.set("mapY", String(filters.mapY));
    if (typeof filters.radius === "number")
      p.set("radius", String(filters.radius));
  }

  return `/api/kto/wellness?${p.toString()}`;
}

export default function TourGridClient({
  lang,
  initialItems,
  initialTotal,
  initialPage,
  pageSize,
  filters,
}: Props) {
  const t = useTranslations("button");
  const [items, setItems] = useState<WellnessListItem[]>(initialItems);
  const [page, setPage] = useState<number>(initialPage);
  const [total, setTotal] = useState<number>(initialTotal);
  const [loading, setLoading] = useState(false);

  // URL(검색파라미터) 변경으로 props가 바뀌면, 내부 상태를 갱신
  useEffect(() => {
    setItems(initialItems);
    setPage(initialPage);
    setTotal(initialTotal);
  }, [initialItems, initialPage, initialTotal]);

  const hasMore = page * pageSize < total;

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const next = page + 1;
      const res = await fetch(
        buildApiUrl({ lang, pageNo: next, numOfRows: pageSize, filters }),
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as WellnessListApiResponse;

      // id 기준 중복 제거 병합
      setItems((prev) => {
        const map = new Map<string, WellnessListItem>();
        for (const it of prev) map.set(it.id, it);
        for (const it of data.items) map.set(it.id, it);
        return Array.from(map.values());
      });

      setPage(data.pageNo);
      setTotal(data.totalCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ul className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {items.map((w) => (
          <li key={w.id} className='rounded-xl border overflow-hidden'>
            <TourCard lang={lang} item={w} />
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className='mt-6 flex justify-center'>
          <Button
            type='button'
            variant='brand'
            onClick={loadMore}
            disabled={loading}
            className='disabled:opacity-60 rounded-lg'
          >
            {loading ? t("loading") : t("seeMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
