import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className='w-full border-t px-4 py-8 text-sm text-muted-foreground'>
      <div className='max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* 사업자 정보 */}
        <div className='space-y-1'>
          <p>{t("footer.companyName")}</p>
          <p>{t("footer.ceo")}</p>
          <p>{t("footer.businessNumber")}</p>
          <p>{t("footer.foreignPatientBusiness")}</p>
        </div>

        {/* 주소·문의 */}
        <div className='space-y-1'>
          <p>{t("footer.address")}</p>
          <p>{t("footer.contact")}</p>
        </div>

        {/* 약관 링크 + 저작권 */}
        <div className='flex flex-col items-start md:items-end space-y-2'>
          <div className='flex gap-4'>
            <Link href='/terms' className='hover:text-gray-800'>
              {t("terms-page.title")}
            </Link>
            <Link href='/privacy' className='hover:text-gray-800'>
              {t("privacy-page.title")}
            </Link>
          </div>
          <span>ONYU © 2025. All rights reserved.</span>
        </div>

        {/* 모바일: 순서 2 / 데스크탑: 왼쪽 */}
        {/* <span className='order-2 md:order-1'>
          ONYU © 2025. All rights reserved.
        </span> */}

        {/* 모바일: 순서 1 / 데스크탑: 오른쪽 */}
        {/* <div className='order-1 md:order-2 flex gap-4'>
          <Link href='/terms'>{t("terms-page.title")}</Link>
          <Link href='/privacy'>{t("privacy-page.title")}</Link>
        </div> */}
      </div>
    </footer>
  );
}
