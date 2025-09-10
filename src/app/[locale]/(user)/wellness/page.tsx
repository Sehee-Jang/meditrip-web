import React from "react";
import Link from "next/link";
import fetchWellness from "@/services/kto/fetchWellness";
import type { WellnessListItem } from "@/types/kto-wellness";

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

export default async function WellnessPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const lang = locale === "ko" ? "ko" : "ja";
  const numOfRows = Number(sp.rows ?? "12");
  const pageNo = Number(sp.page ?? "1");
  const lDongRegnCd = sp.sido;
  const lDongSignguCd = sp.sigungu;
  const wellnessThemaCd = sp.theme;
  const mode = sp.mode ?? (sp.q ? "search" : "area");

  const keyword = sp.q?.trim();
  const mapX = sp.mapX ? Number(sp.mapX) : undefined;
  const mapY = sp.mapY ? Number(sp.mapY) : undefined;
  const radius = sp.radius ? Number(sp.radius) : undefined;

  const { items } = await fetchWellness({
    lang,
    pageNo,
    numOfRows,
    lDongRegnCd,
    lDongSignguCd,
    wellnessThemaCd,
    arrange: mode === "location" ? "C" : "C",
    mode,
    keyword,
    withDetail: true, // ✅ 목록에서도 homepage 보강
    mapX,
    mapY,
    radius,
  });

  return (
    <main className='mx-auto max-w-5xl px-4 py-8'>
      <h1 className='mb-2 text-2xl font-semibold'>
        {lang === "ko" ? "웰니스 관광지" : "Wellness Spots"}
      </h1>

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
          {lang === "ko" ? "조회 결과가 없습니다." : "No results."}
        </div>
      ) : (
        <ul className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {items.map((w: WellnessListItem) => {
            const href =
              `/${locale}/wellness/${encodeURIComponent(w.id)}?` +
              (w.address ? `a=${encodeURIComponent(w.address)}&` : "") +
              (w.phone ? `p=${encodeURIComponent(w.phone)}&` : "") +
              (w.homepage ? `u=${encodeURIComponent(w.homepage)}&` : "");
            return (
              <li key={w.id} className='rounded-xl border overflow-hidden'>
                {w.image.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={w.image.thumb}
                    alt={w.title}
                    className='h-40 w-full object-cover'
                  />
                ) : null}
                <div className='p-4'>
                  <Link href={href} className='font-medium hover:underline'>
                    {w.title}
                  </Link>
                  <div className='text-sm text-muted-foreground'>
                    {w.address}
                  </div>
                  {w.phone ? (
                    <div className='text-sm mt-1'>{w.phone}</div>
                  ) : null}
                  {w.coord ? (
                    <div className='text-xs text-muted-foreground mt-1'>
                      lat {w.coord.lat}, lng {w.coord.lng}
                    </div>
                  ) : null}
                  <div className='mt-2 text-xs text-muted-foreground'>
                    theme: {w.themeCode || "-"} · id: {w.id}
                    {w.homepage ? (
                      <>
                        {" "}
                        · <span>website</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
