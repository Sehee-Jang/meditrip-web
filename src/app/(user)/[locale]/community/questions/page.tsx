import { getTranslations } from "next-intl/server";
import QuestionForm from "@/components/questions/QuestionForm";
import PageHeader from "@/components/common/PageHeader";

export default async function AskPage() {
  const t = await getTranslations("question-form");

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title.create")}
        mobileTitle={t("title.create")}
        showBackIcon
        center
      />
      <QuestionForm />
    </main>
  );
}
