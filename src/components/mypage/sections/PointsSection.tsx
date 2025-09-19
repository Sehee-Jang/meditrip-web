"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import UserPointLogDialog from "@/components/mypage/UserPointLogDialog";

export default function PointsSection({ points }: { points: number }) {
  const t = useTranslations("mypage");
  const [open, setOpen] = useState(false);

  return (
    <section>
      <div className='flex items-center justify-between mb-3'>
        <h2 className='text-base font-semibold'>{t("points.title")}</h2>
        <button
          onClick={() => setOpen(true)}
          className='inline-flex items-center gap-1 text-sm
                     text-muted-foreground hover:text-foreground
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        >
          {t("points.use")}
          <ChevronRight size={16} />
        </button>
      </div>

      <div className='flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 shadow-sm'>
        <p className='text-muted-foreground'>{t("points.status")}</p>
        <p className='text-md font-semibold text-card-foreground'>
          {t("points.amount", { amount: points })}
        </p>
      </div>

      {/* 포인트 내역 모달 */}
      <UserPointLogDialog open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
