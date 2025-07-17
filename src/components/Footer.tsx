import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className='w-full border-t bg-white px-4 py-4 text-sm text-gray-600'>
      <div className='max-w-5xl mx-auto flex flex-col items-center gap-2 md:flex-row md:justify-center md:gap-10'>
        
        {/* 모바일: 순서 2 / 데스크탑: 왼쪽 */}
        <span className='order-2 md:order-1'>
          ONYU © 2025. All rights reserved.
        </span>

        {/* 모바일: 순서 1 / 데스크탑: 오른쪽 */}
        <div className='order-1 md:order-2 flex gap-4'>
          <Link href='/terms'>{t("terms")}</Link>
          <Link href='/privacy'>{t("privacy")}</Link>
        </div>
      </div>
    </footer>
  );
}
