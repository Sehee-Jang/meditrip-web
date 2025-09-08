// src/app/[locale]/(user)/hira/page.tsx
import React from "react";
import Link from "next/link";
import fetchOrientalClinics, {
  type ClinicItem,
} from "@/services/hira/fetchClinics";
import fetchClinicDetail from "@/services/hira/fetchClinicDetail";

type SearchParams = {
  q?: string;
  sidoCd?: string;
  sgguCd?: string;
  rows?: string;
};
type PageParams = { locale: string };

export default async function HiraPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const numOfRows = Number(sp.rows ?? "20");
  const yadmNm = typeof sp.q === "string" ? sp.q.trim() : undefined;
  const sidoCd = typeof sp.sidoCd === "string" ? sp.sidoCd : undefined;
  const sgguCd = typeof sp.sgguCd === "string" ? sp.sgguCd : undefined;

  const { items } = await fetchOrientalClinics({
    numOfRows,
    yadmNm,
    sidoCd,
    sgguCd,
  });

  const first: ClinicItem | undefined = items[0];
  const detail = first
    ? await fetchClinicDetail(first.ykiho, {
        name: first.name,
        address: first.address,
        phone: first.phone,
        typeName: first.clCdNm,
        homepage: first.homepage,
        estbDd: first.estbDd,
      })
    : null;

  return (
    <main className='mx-auto max-w-5xl px-4 py-8'>
      <h1 className='mb-2 text-2xl font-semibold'>
        한방 기관(예시 {numOfRows}건)
      </h1>

      <p className='mb-6 text-sm text-muted-foreground'>
        {[
          yadmNm ? `키워드: "${yadmNm}"` : null,
          sidoCd ? `시도코드: ${sidoCd}` : null,
          sgguCd ? `시군구코드: ${sgguCd}` : null,
        ]
          .filter(Boolean)
          .join(" · ") || "전체 조회"}
      </p>

      {items.length === 0 ? (
        <div className='rounded-xl border p-6 text-center text-sm text-muted-foreground'>
          조회 결과가 없습니다. 검색어 또는 지역 필터를 바꿔보세요.
        </div>
      ) : (
        <ul className='mb-10 space-y-3'>
          {items.map((h) => {
            // 상세 페이지 링크에 기본값(폴백) 전달
            const href =
              `/${locale}/hira/${encodeURIComponent(h.ykiho)}?` +
              `n=${encodeURIComponent(h.name)}` +
              `&a=${encodeURIComponent(h.address)}` +
              `&p=${encodeURIComponent(h.phone)}` +
              `&t=${encodeURIComponent(h.clCdNm)}` +
              `&u=${encodeURIComponent(h.homepage)}` +
              `&e=${encodeURIComponent(h.estbDd)}`;

            return (
              <li key={h.ykiho} className='rounded-xl border p-4'>
                <Link href={href} className='font-medium hover:underline'>
                  {h.name}
                </Link>
                <div className='text-sm text-muted-foreground'>{h.address}</div>
                <div className='text-sm'>{h.phone}</div>
                {h.coord && (
                  <div className='text-xs text-muted-foreground'>
                    lat {h.coord.lat}, lng {h.coord.lng}
                  </div>
                )}
                <div className='mt-2 flex items-center justify-between text-xs text-muted-foreground'>
                  <span>
                    종별: {h.clCdNm} ({h.clCd}) · ykiho: {h.ykiho}
                  </span>
                  <Link
                    href={href}
                    className='rounded-lg border px-2 py-1 text-xs hover:bg-accent'
                    aria-label={`${h.name} 상세보기`}
                  >
                    상세보기
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {detail && (
        <section className='rounded-xl border p-4'>
          <h2 className='mb-3 text-xl font-semibold'>
            상세(샘플: 첫 번째 기관)
          </h2>
          <div className='grid gap-2 text-sm'>
            <div>
              <span className='font-medium'>기관명</span>{" "}
              {detail.overview.name ?? "-"}
            </div>
            <div>
              <span className='font-medium'>주소</span>{" "}
              {detail.overview.address ?? "-"}
            </div>
            <div>
              <span className='font-medium'>전화</span>{" "}
              {detail.overview.phone ?? "-"}
            </div>
            <div>
              <span className='font-medium'>종별</span>{" "}
              {detail.overview.typeName ?? "-"}
            </div>
            <div>
              <span className='font-medium'>개설일</span>{" "}
              {detail.overview.establishedAt ?? "-"}
            </div>
            <div>
              <span className='font-medium'>홈페이지</span>{" "}
              {detail.overview.homepage ?? "-"}
            </div>
            <div>
              <span className='font-medium'>진료과목</span>{" "}
              {detail.subjects.length ? detail.subjects.join(", ") : "-"}
            </div>
            <div>
              <span className='font-medium'>시설</span>{" "}
              {detail.facilities.length ? detail.facilities.join(", ") : "-"}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
