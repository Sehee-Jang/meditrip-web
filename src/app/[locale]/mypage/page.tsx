import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";

export default async function MyPage() {
  const t = await getTranslations("MyPage");
  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon
        center
      />
    </main>
  );
}
