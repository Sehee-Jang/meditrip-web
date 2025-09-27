"use client";
import { useTranslations } from "next-intl";
export default function TourNoticeBanner() {
  const enabled = process.env.NEXT_PUBLIC_TOUR_NOTICE_ENABLED === "true";

  const t = useTranslations("messages");

  if (!enabled) return null;

  return (
    <div className='mb-3 rounded-lg border border-amber-400 bg-amber-50 px-3 py-2 text-sm text-amber-900'>
      {t("tour-notice.text")}
    </div>
  );
}
