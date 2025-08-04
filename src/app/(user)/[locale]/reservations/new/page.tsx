import React from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import ReservationForm from "@/components/reservations/ReservationForm";
import { fetchHospitals } from "@/services/hospitals/fetchHospitals";
import type { Hospital } from "@/types/hospital";

type PageParams = Promise<{
  locale: string;
}>;

type SearchParams = Promise<{ hospitalId: string; packageId: string }>;

export default async function NewReservationPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  const { hospitalId, packageId } = await searchParams;

  const hospitals: Hospital[] = await fetchHospitals();
  const hospital = hospitals.find((h) => h.id === hospitalId);
  if (!hospital) return notFound();

  const pkg = hospital.packages.find((p) => p.id === packageId);
  if (!pkg) return notFound();

  return (
    <main className='md:px-4 md:py-8'>
      <PageHeader
        desktopTitle='예약하기'
        mobileTitle='예약하기'
        showBackIcon
        center
      />
      <section className='max-w-lg mx-auto px-4'>
        <ReservationForm
          locale={locale}
          hospitalId={hospitalId}
          packageId={packageId}
          hospitalName={hospital.name}
          packageName={pkg.title}
        />
      </section>
    </main>
  );
}
