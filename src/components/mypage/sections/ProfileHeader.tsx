"use client";

import { useTranslations } from "next-intl";

export default function ProfileHeader({ name }: { name: string }) {
  const t = useTranslations("mypage");
  return (
    <div className='flex items-center gap-4 mb-6'>
      <div className='w-12 h-12 rounded-full bg-gray-300' />
      <p className='text-lg font-medium'>{t("greeting", { name })}</p>
    </div>
  );
}
