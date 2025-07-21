import { getTranslations } from "next-intl/server";
import SearchableContents from "@/components/SearchableContents";
import Container from "@/components/layout/Container";
import { ChevronLeft } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import SignupSection from "@/components/SignupSection";

export default async function ContentsPage() {
  const t = await getTranslations("Contents");

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon
        center
      />
      {/* 모바일 헤더 */}
      {/* <h1 className='flex md:hidden w-full shadow-md text-xl font-bold items-center gap-2 py-3 px-4 mb-4'>
        <ChevronLeft size={24} />
        {t("title")}
      </h1> */}

      <Container>
        {/* 데스크탑 헤더 */}
        {/* <h1 className='hidden md:block md:text-4xl font-bold text-center my-16 mx-40 '>
          {t("title")}
        </h1> */}

        <SearchableContents />
        <SignupSection />
      </Container>
    </main>
  );
}
