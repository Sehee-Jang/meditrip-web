import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";
import QuestionList from "@/components/QuestionList";
import CommonButton from "@/components/layout/CommonButton";

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
        <h2 className='text-lg font-semibold mb-2'>게시판 질문 목록</h2>
        <p className='text-sm text-muted-foreground mb-4'>
          다른 사람들이 궁금해하는 질문과 전문가의 답변을 확인해보세요
        </p>

        <QuestionList />

        <div className='my-6 flex flex-col items-center'>
          <CommonButton className='text-sm'>{t("cta")}</CommonButton>
          <p className='text-sm text-muted-foreground mt-2'>
            질문을 작성하고 예약비 할인을 받으세요!
          </p>
        </div>
      </section>
    </main>
  );
}
