import React from "react";
import PageHeader from "@/components/common/PageHeader";
import { getTranslations } from "next-intl/server";
import MyPageContent from "@/components/mypage/MyPageContent";

export default async function MyPage() {
  const t = await getTranslations("mypage");

  return (
    <main className='max-w-4xl mx-auto md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon
        center
      />

      <MyPageContent />
    </main>
  );
}
