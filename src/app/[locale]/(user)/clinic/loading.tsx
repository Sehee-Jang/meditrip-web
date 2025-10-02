import React from "react";
import ClinicDetailSkeleton from "@/components/clinics/ClinicDetailSkeleton";

export default function Loading() {
  return (
    <main className='md:px-4 md:py-8'>
      <div className='md:hidden mb-6 w-full border-b border-border bg-card'>
        <div className='px-4 py-3'>
          <div className='h-11 w-full rounded-lg bg-muted animate-pulse' />
        </div>
      </div>

      <div className='hidden md:flex items-center justify-between mx-4 md:mx-40 my-16'>
        <div className='h-16 w-full rounded-2xl bg-muted animate-pulse' />
      </div>

      <section className='max-w-4xl mx-auto px-4 py-6 flex flex-col gap-8'>
        <ClinicDetailSkeleton />
      </section>
    </main>
  );
}
