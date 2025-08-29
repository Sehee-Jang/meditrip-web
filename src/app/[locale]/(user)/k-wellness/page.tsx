import React from "react";
import { getTranslations } from "next-intl/server";

export default async function ComingSoonPage() {
  const t = await getTranslations("coming-soon");

  return (
    <main className='mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center'>
      {/* 심플한 아이콘/뱃지 느낌 */}
      <div className='mb-4 rounded-2xl border border-dashed p-3 text-sm text-slate-500'>
        {t("underConstruction.badge")}
      </div>

      <h1 className='text-2xl font-semibold'>{t("underConstruction.title")}</h1>
      <p className='mt-2 text-slate-600'>{t("underConstruction.desc")}</p>
    </main>
  );
}
