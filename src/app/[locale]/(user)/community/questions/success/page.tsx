import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/common/PageHeader";
import { Link } from "@/i18n/navigation";

export default async function QuestionSuccessPage() {
  const t = await getTranslations("question-success");

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader desktopTitle={t("header")} mobileTitle={t("header")} center />

      <section className='max-w-2xl mx-auto px-4 py-8 text-center space-y-6'>
        <div className='space-y-2'>
          <p className='text-lg font-semibold'>🎉 {t("successMessage")}</p>
          <p className='text-sm text-muted-foreground'>{t("infoMessage")}</p>
          <p className='text-xs text-gray-400'>{t("subInfo")}</p>
        </div>

        <div className='flex justify-center gap-3'>
          <Link
            href='/'
            className='border border-gray-400 rounded-md px-4 py-2 text-sm'
          >
            {t("goHome")}
          </Link>

          <Link
            href='/community'
            className='bg-black text-white rounded-md px-4 py-2 text-sm'
          >
            {t("goToQuestions")}
          </Link>
        </div>

        <p className='text-sm text-center text-yellow-600 font-medium'>
          🎉 {t("pointInfo")}
        </p>
      </section>
    </main>
  );
}
