import React from "react";
import PageHeader from "@/components/common/PageHeader";
import { getTranslations } from "next-intl/server";
import HospitalListClient from "@/components/hospitals/HospitalListClient";

export default async function HospitalPage() {
  const t = await getTranslations("hospital-page");

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon
        center
      />

      {/* 병원 카드 목록 */}
      <HospitalListClient />
    </main>
  );
}
