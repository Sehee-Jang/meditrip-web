import { getTranslations } from "next-intl/server";
import SearchableContents from "@/components/contents/SearchableContents";
import Container from "@/components/common/Container";

import PageHeader from "@/components/common/PageHeader";
import SignupSection from "@/components/common/signup/SignupSection";
import type { CategoryKey } from "@/constants/categories";

type SearchParams = {
  categories?: string | string[];
  q?: string;
};

export default async function ContentsPage({
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations("contents-page");
  const sp = await searchParams;

  // categories 파싱: 단일/배열/콤마 모두 허용
  const raw = sp?.categories;
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const flat = arr
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
  const initialSelectedCategories = Array.from(new Set(flat)) as CategoryKey[];
  const initialKeyword = typeof sp?.q === "string" ? sp.q : "";

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon
        center
      />

      <Container>
        <SearchableContents
          initialKeyword={initialKeyword}
          initialSelectedCategories={initialSelectedCategories}
        />

        <SignupSection />
      </Container>
    </main>
  );
}
