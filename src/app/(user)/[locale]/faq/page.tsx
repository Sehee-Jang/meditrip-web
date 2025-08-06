import { getTranslations } from "next-intl/server";
import FaqAccordion from "@/components/faq/FaqAccordion";
import PageHeader from "@/components/common/PageHeader";

export default async function FAQPage() {
  const t = await getTranslations("faq-page");
  const items = t.raw("items") as { question: string; answer: string }[];

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon
        center
      />

      {/* 자주 묻는 질문 리스트 */}
      <FaqAccordion items={items} />
    </main>
  );
}
