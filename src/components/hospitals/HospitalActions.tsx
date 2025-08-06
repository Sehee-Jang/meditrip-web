"use client";

import Link from "next/link";
import CommonButton from "@/components/common/CommonButton";
import { Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HospitalActions() {
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
