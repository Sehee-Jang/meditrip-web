"use client";

import { useRouter } from "@/i18n/navigation";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { CalendarCheck, Share2 } from "lucide-react";
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
    <div
      className='
        fixed z-50 right-4 md:right-6
        bottom-[calc(env(safe-area-inset-bottom)+16px)]
        md:bottom-[calc(env(safe-area-inset-bottom)+24px)]
      '
      aria-label='floating-actions'
    >
      <div className='flex flex-col items-center gap-2'>
        {/* 예약하기 버튼 */}
        <button
          type='button'
          onClick={handleBookClick}
          disabled={loading}
          className='
              inline-flex items-center justify-center
              rounded-full px-5 py-3 text-white font-semibold
              bg-gradient-to-r from-blue-500 to-blue-600
              hover:from-blue-600 hover:to-blue-700
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300
              shadow-sm disabled:opacity-70
            '
        >
          <CalendarCheck className='w-5 h-5' />
          <span className='hidden sm:inline ml-2'>
            {t("clinicDetail.bookButton")}
          </span>
        </button>

        {/* 공유하기 버튼 */}
        <button
          type='button'
          onClick={handleShare}
          className='
              inline-flex items-center justify-center
              rounded-full px-4 py-3 border border-gray-300
              text-gray-800 bg-white hover:bg-gray-50
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300
            '
          aria-label={t("clinicDetail.shareButton")}
        >
          <Share2 className='w-5 h-5' />
          <span className='hidden sm:inline ml-2'>
            {t("clinicDetail.shareButton")}
          </span>
        </button>
      </div>

      {/* 내부 예약 링크(추후 활성화) */}
      {/* <div className='mt-2 text-center'>
          <Link
            href={`/hospital/${hospitalId}/package/${packageId}/reserve`}
            className='text-xs text-gray-600 hover:text-gray-800 underline underline-offset-4'
          >
            {t("clinicDetail.reservePageLink")}
          </Link>
        </div> */}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-unused-vars */
