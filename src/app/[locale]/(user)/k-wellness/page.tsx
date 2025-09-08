
import { getTranslations } from "next-intl/server";
import { CATEGORY_KEYS, type CategoryKey } from "@/constants/categories";
import Container from "@/components/common/Container";

type SearchParams = {
  categories?: string | string[];
  q?: string;
};

// 런타임 가드: 쿼리값이 실제 CategoryKey인지 확인
function isCategoryKey(v: unknown): v is CategoryKey {
  return (
    typeof v === "string" && (CATEGORY_KEYS as readonly string[]).includes(v)
  );
}

export default async function KWellsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations("coming-soon");

  const sp = await searchParams;

  // categories 파싱: 단일/배열/콤마 모두 허용
  const raw = sp?.categories;
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const flat = arr
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);

  // 유효한 카테고리만 남기고 중복 제거
  const initialSelectedCategories: CategoryKey[] = Array.from(
    new Set(flat.filter(isCategoryKey))
  );

  const initialKeyword = typeof sp?.q === "string" ? sp.q : "";

  return (
    <main className='mx-auto min-h-[70vh] px-4'>
      <Container className='max-w-2xl'>
        <section className='flex min-h-[60vh] flex-col items-center justify-center text-center'>
          {/* 간단 배지 */}
          <div className='mb-4 rounded-2xl border border-dashed p-3 text-sm text-slate-500'>
            {t("underConstruction.badge")}
          </div>

          <h1 className='text-2xl font-semibold'>
            {t("underConstruction.title")}
          </h1>
          <p className='mt-2 text-slate-600'>{t("underConstruction.desc")}</p>

          {/* 선택 상태 시각 확인용 임시 표시(향후 제거 가능) */}
          <div className='mt-6 text-sm text-slate-500'>
            {initialSelectedCategories.length > 0 ? (
              <p>카테고리: {initialSelectedCategories.join(", ")}</p>
            ) : (
              <p>카테고리 전체</p>
            )}
            {initialKeyword && <p>키워드: {initialKeyword}</p>}
          </div>
        </section>
      </Container>
    </main>
  );
}
