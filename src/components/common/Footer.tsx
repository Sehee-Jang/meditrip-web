import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className='w-full border-t px-4 py-8 text-sm text-muted-foreground'>
      <div className='max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* 사업자 정보 */}
        <div className=''>
          {/* 사업자 1 */}
          <div className='border-b pb-3'>
            <p>{t("footer.companyName1")}</p>
            <p>{t("footer.ceo1")}</p>
            <p>{t("footer.businessNumber1")}</p>
          </div>

          {/* 사업자 2 */}
          <div className='pt-3'>
            <p>{t("footer.companyName2")}</p>
            <p>{t("footer.ceo2")}</p>
            <p>{t("footer.businessNumber2")}</p>
            <p>{t("footer.foreignPatientBusiness2")}</p>
          </div>
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
      </div>
    </footer>
  );
}
