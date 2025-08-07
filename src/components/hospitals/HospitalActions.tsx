"use client";

import { useRouter } from "next/navigation";
import { useAuthCheck } from "@/hooks/useAuthCheck";
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
  const router = useRouter();
  const { isLoggedIn, loading } = useAuthCheck();

  // 예약버튼 핸들러
  const handleBookClick = () => {
    if (loading) return; // 로그인 상태 로딩 중이면 무시
    if (isLoggedIn) {
      window.open("https://ko.surveymonkey.com/r/YXDPQ5Q", "_blank");
    } else {
      router.push("/login");
    }
  };

  // 공유버튼 핸들러
  const handleShare = () => {
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

      {/* 예약 버튼 */}
      <CommonButton onClick={handleBookClick} disabled={loading}>
        {t("clinicDetail.bookButton")}
      </CommonButton>

      {/* 공유 버튼 */}
      <CommonButton variant='outline' onClick={handleShare}>
        <Share2 className='w-5 h-5 mr-2' />
        {t("clinicDetail.shareButton")}
      </CommonButton>
    </section>
  );
}
/* eslint-enable @typescript-eslint/no-unused-vars */
