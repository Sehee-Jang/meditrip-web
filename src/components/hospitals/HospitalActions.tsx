"use client";

import Link from "next/link";
import CommonButton from "@/components/common/CommonButton";
import { Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
/* eslint-disable @typescript-eslint/no-unused-vars */
interface HospitalActionsProps {
  locale: string;
  hospitalId: string;
  packageId: string;
}

export default function HospitalActions({
  locale,
  hospitalId,
  packageId,
}: HospitalActionsProps) {
  const t = useTranslations("hospital-list");

  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      });
    }
  };

  return (
    <section className='flex justify-center space-x-4 pt-6'>
      {/* 추후 활성화할 예약 링크 */}
      {/* <Link
        href={`/${locale}/hospital/${hospitalId}/package/${packageId}/reserve`}
      >
        <CommonButton>{t("clinicDetail.bookButton")}</CommonButton>
      </Link> */}
      <Link
        href='https://ko.surveymonkey.com/r/YXDPQ5Q'
        target='_blank'
        rel='noopener noreferrer'
      >
        <CommonButton>{t("clinicDetail.bookButton")}</CommonButton>
      </Link>

      <CommonButton variant='outline' onClick={share}>
        <Share2 className='w-5 h-5 mr-2' />
        {t("clinicDetail.shareButton")}
      </CommonButton>
    </section>
  );
}
/* eslint-enable @typescript-eslint/no-unused-vars */