import { getTranslations } from "next-intl/server";
import SearchableContents from "@/components/SearchableContents";
import Container from "@/components/layout/Container";

export default async function ContentsPage() {
  const t = await getTranslations("Contents");

  return (
    <main className='px-4 py-8'>
      <Container>
        <h1 className='text-2xl font-bold text-center my-16 mx-40'>
          {t("title")}
        </h1>

        <SearchableContents />
      </Container>
    </main>
  );
}
