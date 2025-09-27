"use client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function TourNoticeBanner() {
  const [enabled, setEnabled] = useState(false);
  const t = useTranslations("messages.tour-notice");

  useEffect(() => {
    setEnabled(process.env.NEXT_PUBLIC_TOUR_NOTICE_ENABLED === "true");
  }, []);

  if (!enabled) return null;

  return (
    <div className='mb-3 rounded-lg border border-amber-400 bg-amber-50 px-3 py-2 text-sm text-amber-900'>
      {t("text")}
    </div>
  );
}
