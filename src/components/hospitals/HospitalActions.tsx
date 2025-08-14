"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { CalendarCheck, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface HospitalActionsProps {
  locale: string;
  hospitalId: string;
  packageId: string;
  bookingUrl?: string;
}

export default function HospitalActions(props: HospitalActionsProps) {
  const { bookingUrl = "https://ko.surveymonkey.com/r/YXDPQ5Q" } = props;

  const t = useTranslations("hospital-list");
  const router = useRouter();
  const { isLoggedIn, loading } = useAuthCheck();
  const [open, setOpen] = useState(false);
  // iframe 차단/지연 시 fallback 버튼 노출
  const [showIframeFallback, setShowIframeFallback] = useState(false);

  // 예약 버튼: 로그인시 모달, 비로그인시 로그인 페이지로 이동
  const handleBookClick = () => {
    if (loading) return; // 로그인 상태 로딩 중이면 무시
    if (isLoggedIn) {
      setOpen(true);
    } else {
      router.push("/login", { locale: props.locale as "ko" | "ja" });
    }
  };

  // 공유 버튼(웹 쉐어 API)
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      });
    }
  };

  // iframe 로드 실패 대비: 2초 내 onLoad 없으면 fallback 버튼 노출
  useEffect(() => {
    if (!open) return;
    setShowIframeFallback(false);
    const timer = window.setTimeout(() => setShowIframeFallback(true), 2000);
    return () => window.clearTimeout(timer);
  }, [open]);

  // ESC로 모달 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* 플로팅 액션들 */}
      <div
        className='
          fixed z-50 right-4 md:right-6
          bottom-[calc(env(safe-area-inset-bottom)+16px)]
          md:bottom-[calc(env(safe-area-inset-bottom)+24px)]
        '
        aria-label='floating-actions'
      >
        <div className='flex flex-col items-center gap-2'>
          {/* 예약하기 버튼 → 모달 오픈 */}
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
            <CalendarCheck className='w-5 h-5' aria-hidden='true' />
            <span className='hidden sm:inline ml-2'>
              {t("book.bookButton")}
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
            aria-label={t("book.shareButton")}
          >
            <Share2 className='w-5 h-5' aria-hidden='true' />
            <span className='hidden sm:inline ml-2'>
              {t("book.shareButton")}
            </span>
          </button>
        </div>

        {/* 내부 예약 링크(추후 활성화) */}
        {/* <div className='mt-2 text-center'>
          <Link
            href={`/hospital/${hospitalId}/package/${packageId}/reserve`}
            className='text-xs text-gray-600 hover:text-gray-800 underline underline-offset-4'
          >
            {t("book.reservePageLink")}
          </Link>
        </div> */}
      </div>

      {/* 예약 모달 */}
      {open && (
        <div
          role='dialog'
          aria-modal='true'
          className='fixed inset-0 z-[60] flex items-center justify-center'
        >
          {/* dim 클릭 → 닫기 */}
          <div
            className='absolute inset-0 bg-black/50'
            onClick={() => setOpen(false)}
          />
          {/* 모달 컨테이너 */}
          <div className='relative z-[61] w-[92vw] max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4 md:p-5'>
            {/* 헤더 */}
            <div className='flex items-center justify-between mb-3'>
              <h2 className='text-base md:text-lg font-semibold'>
                {t("book.bookModalTitle")}
              </h2>
              <button
                type='button'
                onClick={() => setOpen(false)}
                className='text-sm text-slate-600 hover:underline'
              >
                {t("book.close")}
              </button>
            </div>

            {/* 본문: 예약 URL 임베드 */}
            <div className='rounded-lg overflow-hidden border border-slate-200'>
              <iframe
                title={t("book.bookModalTitle")}
                src={bookingUrl}
                className='w-full h-[70vh] md:h-[65vh]'
                referrerPolicy='strict-origin-when-cross-origin'
                onLoad={() => setShowIframeFallback(false)}
              />
            </div>

            {/* iframe 차단/지연 시 대안 링크 */}
            {showIframeFallback && (
              <div className='mt-3 text-right'>
                <a
                  href={bookingUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 text-sm underline'
                >
                  {t("book.openInNewTab")}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
