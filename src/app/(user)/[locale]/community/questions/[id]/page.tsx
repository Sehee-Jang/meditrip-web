import { getQuestionById } from "@/services/questions/getQuestionById";
import QuestionDetail from "@/components/questions/QuestionDetail";
import PageHeader from "@/components/common/PageHeader";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

type PageParams = Promise<{ id: string }>;

export default async function QuestionDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { id } = await params;
  const question = await getQuestionById(id);
  const t = await getTranslations("question-detail");

  if (!question) return notFound();

  return (
    <main>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon
        center
      />
      <QuestionDetail question={question} />
    </main>
  );
}
