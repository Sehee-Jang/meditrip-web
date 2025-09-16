import { getTranslations } from "next-intl/server";
import { CATEGORY_KEYS, type CategoryKey } from "@/constants/categories";
import Container from "@/components/common/Container";
import ArticlesListClient from "@/components/articles/ArticlesListClient";
import PageHeader from "@/components/common/PageHeader";
import LatestArticleClient from "@/components/articles/LatestArticleClient";

type SearchParams = {
  categories?: string | string[];
  q?: string;
};

function isCategoryKey(v: unknown): v is CategoryKey {
  return (
    typeof v === "string" && (CATEGORY_KEYS as readonly string[]).includes(v)
  );
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations("article");
  const sp = await searchParams;

  const raw = sp?.categories;
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const flat = arr
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
  const initialSelectedCategories: CategoryKey[] = Array.from(
    new Set(flat.filter(isCategoryKey))
  );
  const initialKeyword = typeof sp?.q === "string" ? sp.q : "";

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("common.title")}
        mobileTitle={t("common.title")}
        desc={t("common.desc")}
        showBackIcon
        center
      />

      {/* 1) 리스트(행 형태) */}
      <Container className='mb-10'>
        <ArticlesListClient
          initialSelectedCategories={initialSelectedCategories}
          initialKeyword={initialKeyword}
          view='list' // ⬅️ 행 리스트 모드
        />
      </Container>

      {/* 2) 최신글 */}
      <Container>
        <LatestArticleClient /> {/* ⬅️ 카드로 최신글 1개 강조 */}
      </Container>
    </main>
  );
}
