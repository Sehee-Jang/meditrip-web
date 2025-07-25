import { getTranslations } from "next-intl/server";
import SearchableContents from "@/components/SearchableContents";
import Container from "@/components/layout/Container";

import PageHeader from "@/components/layout/PageHeader";
import SignupSection from "@/components/SignupSection";

export default async function ContentsPage() {
  const t = await getTranslations("contents-page");

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon
        center
      />

      <Container>
        <SearchableContents />
        <SignupSection />
      </Container>
    </main>
  );
}
