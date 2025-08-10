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
          className='inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900'
        >
          {t("points.use")}
          <ChevronRight size={16} />
        </button>
      </div>

      <div className='rounded-2xl border bg-white shadow-sm px-5 py-4 flex items-center justify-between'>
        <p className='text-gray-600'>{t("points.status")}</p>
        <p className='text-md font-semibold'>
          {t("points.amount", { amount: points })}
        </p>
      </div>

      {/* 포인트 내역 모달 */}
      <UserPointLogDialog open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
