"use client";

import { useTranslations } from "next-intl";
import CommonButton from "@/components/common/CommonButton";
import type { Reservation } from "@/types/mypage";

export default function ReservationsSection({
  reservations,
}: {
  reservations: Reservation[];
}) {
  const t = useTranslations("mypage");

  return (
    <section>
      <div className='flex items-center justify-between mb-3'>
        <h2 className='text-base font-semibold'>{t("reservations.title")}</h2>
      </div>

      {reservations.length === 0 ? (
        <div className='rounded-2xl border border-border bg-card px-5 py-6 text-center text-sm text-muted-foreground shadow-sm'>
          {t("reservations.empty")}
        </div>
      ) : (
        <ul className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {reservations.map((r) => (
            <li
              key={r.id}
              className='flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm'
            >
              <div className='font-medium'>{r.clinic}</div>
              <div className='text-sm text-muted-foreground'>
                {t("reservations.datetime")}: {r.date}
              </div>
              <div className='text-sm'>
                {t("reservations.status")}:{" "}
                {r.status === "completed"
                  ? t("reservations.completed")
                  : t("reservations.pending")}
              </div>
              <div className='mt-2 flex gap-2'>
                <CommonButton className='text-sm'>
                  {t("reservations.details")}
                </CommonButton>
                <CommonButton className='text-sm border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground'>
                  {t("reservations.modify")}
                </CommonButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
