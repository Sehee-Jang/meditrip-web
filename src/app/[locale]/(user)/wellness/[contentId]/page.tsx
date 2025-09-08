import React from "react";
import fetchWellnessDetail from "@/services/kto/fetchWellnessDetail";

export default async function WellnessDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; contentId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, contentId } = await params;
  const sp = await searchParams;

  const lang = locale === "en" ? "en" : "ko";
  const get = (k: string): string | undefined => {
    const v = sp[k];
    return typeof v === "string" ? v : undefined;
    // 배열인 경우까지 파싱하려면 Array.isArray(v)로 join하세요
  };

  const d = await fetchWellnessDetail(contentId, {
    lang,
    addressFallback: get("a"),
    phoneFallback: get("p"),
    homepageFallback: get("u"),
    contentTypeId: get("ct"),
  });

  return (
    <main className='mx-auto max-w-5xl px-4 py-8'>
      <h1 className='text-2xl font-semibold mb-3'>
        {d.title || (lang === "ko" ? "상세 정보" : "Wellness Detail")}
      </h1>

      {d.imageList[0]?.original ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={d.imageList[0].original}
          alt={d.imageList[0].name ?? d.title ?? "image"}
          className='mb-4 h-64 w-full object-cover rounded-xl'
        />
      ) : null}

      <section className='mb-8 grid gap-2 text-sm'>
        <div>
          <span className='font-medium'>
            {lang === "ko" ? "주소" : "Address"}
          </span>{" "}
          {d.address ?? "-"}
        </div>
        <div>
          <span className='font-medium'>
            {lang === "ko" ? "전화" : "Phone"}
          </span>{" "}
          {d.phone ?? "-"}
        </div>
        <div>
          <span className='font-medium'>Website</span>{" "}
          {d.homepage ? (
            <a
              href={d.homepage}
              target='_blank'
              rel='noopener noreferrer'
              className='underline underline-offset-2'
            >
              {d.homepage.replace(/^https?:\/\//i, "")}
            </a>
          ) : (
            "-"
          )}
        </div>
        {d.coord ? (
          <div className='text-xs text-muted-foreground'>
            lat {d.coord.lat}, lng {d.coord.lng}
          </div>
        ) : null}
        {d.overview ? (
          <p className='mt-2 whitespace-pre-wrap leading-relaxed'>
            {d.overview}
          </p>
        ) : null}
      </section>

      {d.introFields.length > 0 && (
        <section className='mb-8'>
          <h2 className='text-xl font-semibold mb-3'>
            {lang === "ko" ? "이용/편의 정보" : "Visitor Info"}
          </h2>
          <div className='grid gap-2 text-sm'>
            {d.introFields.map((row, i) => (
              <div key={`${row.label}-${i}`}>
                <span className='font-medium'>{row.label}</span>{" "}
                <span dangerouslySetInnerHTML={{ __html: row.value }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {(d.info.extras.length > 0 ||
        d.info.subItems.length > 0 ||
        d.info.rooms.length > 0) && (
        <section className='mb-8'>
          <h2 className='text-xl font-semibold mb-3'>
            {lang === "ko" ? "세부 안내" : "Details"}
          </h2>

          {d.info.extras.length > 0 && (
            <div className='mb-6 grid gap-1 text-sm'>
              {d.info.extras.map((ex, idx) => (
                <div key={`${ex.name}-${idx}`}>
                  <span className='font-medium'>{ex.name}</span>{" "}
                  <span dangerouslySetInnerHTML={{ __html: ex.text }} />
                </div>
              ))}
            </div>
          )}

          {d.info.subItems.length > 0 && (
            <>
              <h3 className='font-medium mb-2'>
                {lang === "ko" ? "프로그램/코스" : "Programs"}
              </h3>
              <ul className='grid gap-4 md:grid-cols-2'>
                {d.info.subItems.map((s, idx) => (
                  <li
                    key={`${s.name}-${idx}`}
                    className='rounded-xl border p-3'
                  >
                    {s.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.image}
                        alt={s.alt ?? s.name ?? "sub"}
                        className='mb-2 h-40 w-full object-cover rounded-lg'
                      />
                    ) : null}
                    {s.name ? (
                      <div className='font-medium'>{s.name}</div>
                    ) : null}
                    {s.overview ? (
                      <div
                        className='text-sm text-muted-foreground'
                        dangerouslySetInnerHTML={{ __html: s.overview }}
                      />
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          )}

          {d.info.rooms.length > 0 && (
            <>
              <h3 className='font-medium mt-6 mb-2'>
                {lang === "ko" ? "객실 정보" : "Rooms"}
              </h3>
              <ul className='grid gap-4 md:grid-cols-2'>
                {d.info.rooms.map((r, idx) => (
                  <li
                    key={`${r.title}-${idx}`}
                    className='rounded-xl border p-3'
                  >
                    {r.images[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.images[0].url}
                        alt={r.images[0].alt ?? r.title ?? "room"}
                        className='mb-2 h-40 w-full object-cover rounded-lg'
                      />
                    ) : null}
                    {r.title ? (
                      <div className='font-medium'>{r.title}</div>
                    ) : null}
                    <div className='text-sm text-muted-foreground'>
                      {[
                        r.size ? `size ${r.size}` : null,
                        r.baseCount ? `base ${r.baseCount}` : null,
                        r.maxCount ? `max ${r.maxCount}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {d.imageList.length > 1 && (
        <section>
          <h2 className='text-xl font-semibold mb-3'>
            {lang === "ko" ? "이미지" : "Images"}
          </h2>
          <ul className='grid gap-3 md:grid-cols-3'>
            {d.imageList.slice(1).map((im, i) => (
              <li
                key={`${im.original}-${i}`}
                className='rounded-xl overflow-hidden border'
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={im.original}
                  alt={im.name ?? `image-${i}`}
                  className='h-40 w-full object-cover'
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
