import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import EditQuestionForm from "@/components/questions/EditQuestionForm";
import PageHeader from "@/components/common/PageHeader";
import { getQuestionById } from "@/services/questions/getQuestionById";

type PageProps = Promise<{ id: string }>;

export default async function EditQuestionPage({
  params,
}: {
  params: PageProps;
}) {
  const { id } = await params;
  const t = await getTranslations("question-form");

  const question = await getQuestionById(id);
  if (!question) return notFound();

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
