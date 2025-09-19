"use client";

import { Link } from "@/i18n/navigation";
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
        {/* 로그아웃 버튼 */}
        <CommonButton
          className='text-sm border border-border bg-card text-card-foreground
                     hover:bg-accent hover:text-accent-foreground
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          onClick={onLogout}
        >
          {t("buttons.logout")}
        </CommonButton>

        {/* 설정 버튼*/}
        <Link href={settingsHref}>
          <CommonButton className='text-sm'>
            {t("buttons.settings")}
          </CommonButton>
        </Link>
      </div>

      {/* 모바일 */}
      <div className='md:hidden grid grid-cols-2 gap-2 mb-8'>
        <CommonButton
          className='text-sm border border-border bg-card text-card-foreground
                     hover:bg-accent hover:text-accent-foreground
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          onClick={onLogout}
        >
          {t("buttons.logout")}
        </CommonButton>
        <Link href={settingsHref}>
          <CommonButton className='w-full text-sm'>
            {t("buttons.settings")}
          </CommonButton>
        </Link>
      </div>
    </section>
  );
}
