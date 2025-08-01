import { getTranslations } from "next-intl/server";
import SearchableContents from "@/components/contents/SearchableContents";
import Container from "@/components/common/Container";

import PageHeader from "@/components/common/PageHeader";
import SignupSection from "@/components/common/signup/SignupSection";

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
