import React from "react";
import PageHeader from "@/components/common/PageHeader";
import { getTranslations } from "next-intl/server";
import HospitalListClient from "@/components/hospitals/HospitalListClient";

export default async function HospitalPage() {
  const t = await getTranslations("clinic");

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("page.title")}
        mobileTitle={t("page.title")}
        showBackIcon
        center
      />

      {/* 병원 카드 목록 */}
      <HospitalListClient />
    </main>
  );
}
