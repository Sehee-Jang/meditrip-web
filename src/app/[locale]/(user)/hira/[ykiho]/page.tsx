import fetchClinicDetail from "@/services/hira/fetchClinicDetail";

export default async function ClinicDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ ykiho: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { ykiho } = await params;
  const sp = await searchParams;

  const get = (k: string): string | undefined => {
    const v = sp[k];
    return typeof v === "string" ? v : undefined;
  };

  const d = await fetchClinicDetail(ykiho, {
    name: get("n"),
    address: get("a"),
    phone: get("p"),
    typeName: get("t"),
    homepage: get("u"),
    estbDd: get("e"),
  });

  return (
    <main className='mx-auto max-w-4xl px-4 py-8'>
      <h1 className='text-2xl font-semibold mb-4'>
        {d.overview.name ?? "상세 정보"}
      </h1>
      <div className='space-y-2 text-sm'>
        <div>주소: {d.overview.address ?? "-"}</div>
        <div>전화: {d.overview.phone ?? "-"}</div>
        <div>종별: {d.overview.typeName ?? "-"}</div>
        <div>개설일: {d.overview.establishedAt ?? "-"}</div>
        <div>
          <span className='font-medium'>홈페이지</span>{" "}
          {d.overview.homepage ? (
            <a
              href={d.overview.homepage}
              target='_blank'
              rel='noopener noreferrer'
              className='underline underline-offset-2'
            >
              {d.overview.homepage.replace(/^https?:\/\//i, "")}
            </a>
          ) : (
            "-"
          )}
        </div>

        <div>진료과목: {d.subjects.length ? d.subjects.join(", ") : "-"}</div>
        <div>시설: {d.facilities.length ? d.facilities.join(", ") : "-"}</div>
      </div>
    </main>
  );
}
