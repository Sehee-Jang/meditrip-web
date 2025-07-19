import { getTranslations } from "next-intl/server";
import SearchableContents from "@/components/SearchableContents";

export default async function ContentsPage() {
  const t = await getTranslations("Contents");

  return (
    <main className='px-4 py-8'>
      <h1 className='text-2xl font-bold text-center my-16 mx-40'>
        {t("title")}
      </h1>

      <SearchableContents />
    </main>
  );
}
