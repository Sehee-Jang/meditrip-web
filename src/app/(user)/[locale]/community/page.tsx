import React from "react";
import PageHeader from "@/components/common/PageHeader";
import { getTranslations } from "next-intl/server";
import CommonButton from "@/components/common/CommonButton";
import { Link } from "@/i18n/navigation";
import PaginatedQuestionList from "@/components/questions/PaginatedQuestionList";
import AskQuestionButton from "@/components/questions/AskQuestionButton";

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

        {/* <QuestionList /> */}
        <PaginatedQuestionList pageSize={5} />

        {/* 글쓰기 버튼 */}
        <AskQuestionButton />
      </section>
    </main>
  );
}
