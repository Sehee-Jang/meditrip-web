import React from "react";
import fetchWellness from "@/services/kto/fetchWellness";
import PageHeader from "@/components/common/PageHeader";
import { getTranslations } from "next-intl/server";
import TourGridClient from "@/components/tour/TourGridClient";
import TourFiltersClient from "@/services/tour/TourFiltersClient";

type PageParams = { locale: string };
type SearchParams = {
  sido?: string; // lDongRegnCd
  sigungu?: string; // lDongSignguCd
  theme?: string; // EX050300 등
  rows?: string;
  page?: string;
  q?: string; // search keyword
  mode?: "area" | "search" | "location";
  mapX?: string;
  mapY?: string;
  radius?: string;
};

export default async function TourPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations("tour-page");

  const lang = locale === "ko" ? "ko" : "ja";
  const numOfRows = Number(sp.rows ?? "12");
  const pageNo = Number(sp.page ?? "1");
  const lDongRegnCd = sp.sido;
  const lDongSignguCd = sp.sigungu;
  const wellnessThemaCd = sp.theme;
  const mode: "area" | "search" | "location" =
    sp.mode ?? (sp.q ? "search" : "area");

  const keyword = sp.q?.trim();
  const mapX = sp.mapX ? Number(sp.mapX) : undefined;
  const mapY = sp.mapY ? Number(sp.mapY) : undefined;
  const radius = sp.radius ? Number(sp.radius) : undefined;

  const arrange = mode === "location" ? "E" : "C";
  let items: Awaited<ReturnType<typeof fetchWellness>>["items"] = [];
  let totalCount = 0;
  try { 
     const res = await fetchWellness({
       lang,
       pageNo,
       numOfRows,
       lDongRegnCd,
       lDongSignguCd,
       wellnessThemaCd,
       arrange,
       mode,
       keyword,
       withDetail: false,
       mapX,
       mapY,
       radius,
     });
        items = res.items;
        totalCount = res.totalCount ?? res.items.length;
  } catch (e) {
    // 서버가 터지지 않도록 흡수 + 로깅
    console.error("[/ko/tour] wellness fetch failed:", e);
  }
 

  const gridKey = JSON.stringify({
    mode,
    lDongRegnCd,
    lDongSignguCd,
    wellnessThemaCd,
    keyword,
    mapX,
    mapY,
    radius,
    numOfRows,
  });

  return (
    <main className='mx-auto max-w-5xl px-4 py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon
        center
      />

      <TourFiltersClient lang={lang} />

      <p className='mb-6 text-sm text-muted-foreground'>
        {[
          mode ? `mode ${mode}` : null,
          lDongRegnCd ? `시도 ${lDongRegnCd}` : null,
          lDongSignguCd ? `시군구 ${lDongSignguCd}` : null,
          wellnessThemaCd ? `테마 ${wellnessThemaCd}` : null,
          keyword ? `키워드 "${keyword}"` : null,
        ]
          .filter(Boolean)
          .join(" · ") || (lang === "ko" ? "전체" : "All")}
      </p>

      {items.length === 0 ? (
        <div className='rounded-xl border p-6 text-center text-sm text-muted-foreground'>
          {lang === "ko"
            ? "현재 조건에 맞는 결과가 없거나, 데이터를 불러오지 못했습니다."
            : "No results or failed to load data."}
        </div>
      ) : (
        <TourGridClient
          lang={lang}
          key={gridKey}
          initialItems={items}
          initialTotal={totalCount ?? items.length}
          initialPage={pageNo}
          pageSize={numOfRows}
          filters={{
            mode,
            lDongRegnCd,
            lDongSignguCd,
            wellnessThemaCd,
            keyword,
            mapX,
            mapY,
            radius,
          }}
        />
      )}
    </main>
  );
}
