import React from "react";
import PageHeader from "@/components/common/PageHeader";
import { getTranslations } from "next-intl/server";
import ClinicList from "@/components/hospitals/ClinicList";
import { fetchHospitals } from "@/services/hospitals/fetchHospitals";

export default async function HospitalPage() {
  const t = await getTranslations("hospital-page");

  const hospitals = await fetchHospitals();
  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon
        center
      />
      {/* 병원 카드 목록 */}
      <ClinicList clinics={hospitals} />
    </main>
  );
}
