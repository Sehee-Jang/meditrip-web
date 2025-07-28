import { getTranslations } from "next-intl/server";
import EditQuestionForm from "@/components/questions/EditQuestionForm";
import PageHeader from "@/components/layout/PageHeader";
import { getQuestionById } from "@/services/questions/getQuestionById";

type PageProps = Promise<{ id: string }>;

export default async function EditQuestionPage({
  params,
}: {
  params: PageProps;
}) {
  const { id } = await params;
  const question = await getQuestionById(id);
  const t = await getTranslations("question-form");

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title.edit")}
        mobileTitle={t("title.edit")}
        showBackIcon
        center
      />

      <EditQuestionForm question={question} />
    </main>
  );
}
