import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";
import QuestionList from "@/components/QuestionList";
import CommonButton from "@/components/layout/CommonButton";
import { Link } from "@/i18n/navigation";

export default async function CommunityPage() {
  const t = await getTranslations("community-page");
  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon
        center
      />
      <section className='max-w-4xl mx-auto px-4 py-6'>
        <h2 className='text-lg font-semibold mb-2'>{t("board.title")}</h2>
        <p className='text-sm text-muted-foreground mb-4'>
          {t("board.description")}
        </p>

        <QuestionList />

        <div className='my-6 flex flex-col items-center'>
          <Link href='/community/question' className='w-1/2'>
            <CommonButton className='w-full text-sm'>{t("cta")}</CommonButton>
          </Link>

          {/* <CommonButton className='text-sm'>{t("cta")}</CommonButton> */}
          <p className='text-sm text-muted-foreground mt-2'>{t("banner")}</p>
        </div>
      </section>
    </main>
  );
}
