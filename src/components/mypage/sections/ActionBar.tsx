"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import CommonButton from "@/components/common/CommonButton";

export default function ActionBar({
  onLogout,
  settingsHref,
}: {
  onLogout: () => Promise<void> | void;
  settingsHref: string;
}) {
  const t = useTranslations("mypage");

  return (
    <section className='mt-4'>
      {/* 데스크탑 */}
      <div className='hidden md:flex justify-end gap-2'>
        <CommonButton
          className='text-sm bg-white text-gray-900 border hover:bg-gray-100'
          onClick={onLogout}
        >
          {t("buttons.logout")}
        </CommonButton>
        <Link href={settingsHref}>
          <CommonButton className='text-sm'>
            {t("buttons.settings")}
          </CommonButton>
        </Link>
      </div>

      {/* 모바일 */}
      <div className='md:hidden grid grid-cols-2 gap-2 mb-8'>
        <CommonButton
          className='text-sm bg-white text-gray-900 border hover:bg-gray-100'
          onClick={onLogout}
        >
          {t("buttons.logout")}
        </CommonButton>
        <Link href={settingsHref}>
          <CommonButton className='text-sm w-full'>
            {t("buttons.settings")}
          </CommonButton>
        </Link>
      </div>
    </section>
  );
}
