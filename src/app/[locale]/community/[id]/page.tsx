import { getQuestionById } from "@/services/questions/getQuestionById";
import QuestionDetail from "@/components/questions/QuestionDetail";
import PageHeader from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";

interface Props {
  params: {
    id: string;
  };
}

export default async function QuestionDetailPage({ params }: Props) {
  const question = await getQuestionById(params.id);
  const t = await getTranslations("question-detail");

  return (
    <main className='md:px-4 md:py-8'>
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
