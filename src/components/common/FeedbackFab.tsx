"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ClipboardList } from "lucide-react";

/**
 * 피드백(서비스 개선) 전역 플로팅 버튼
 *
 * - 데스크탑: 우측 하단 고정 탭 형태
 * - 모바일: 우측 하단 원형 FAB
 * - 클릭 시 mode에 따라 새 탭 이동(link) 또는 모달(modal) 노출
 * - 특정 경로는 노출 제외 가능(함수 props 금지 → 문자열 배열로 규칙 전달)
 */
type FeedbackFabProps = {
  surveyUrl?: string;
  mode?: "link" | "modal";
  /** 경로에 포함되면 제외 */
  excludeIncludes?: readonly string[];
  /** 해당 경로로 시작하면 제외 */
  excludeStartsWith?: readonly string[];
  /** 해당 경로와 정확히 일치하면 제외 */
  excludeExact?: readonly string[];
};

export default function FeedbackFab({
  surveyUrl = "https://jp.surveymonkey.com/r/87BV3N9",
  mode = "link",
  excludeIncludes,
  excludeStartsWith,
  excludeExact,
}: FeedbackFabProps) {
  const pathname = usePathname();
  const t = useTranslations("common.feedback");
  const [open, setOpen] = useState(false);
  const [showIframeFallback, setShowIframeFallback] = useState(false);

  /**
   * 노출 제외 여부 계산
   * - 기본 제외: 패키지 상세(/package/, /packages/) — 예약/공유 FAB와 충돌 방지
   * - 추가 제외 규칙: 문자열 배열 기반(함수 props를 쓰지 않는 이유는 Server→Client 직렬화 제약 때문)
   */

  const excluded = useMemo(() => {
    const p = pathname ?? "";
    // 기본 제외: 패키지 상세 페이지
    const defaultExcluded = p.includes("/package/") || p.includes("/packages/");

    // 추가 제외 규칙(옵션)
    const extraExcluded =
      (excludeIncludes?.some((s) => s && p.includes(s)) ?? false) ||
      (excludeStartsWith?.some((s) => s && p.startsWith(s)) ?? false) ||
      (excludeExact?.some((s) => s === p) ?? false);

    return defaultExcluded || extraExcluded;
  }, [pathname, excludeIncludes, excludeStartsWith, excludeExact]);

  // 버튼 핸들러
  const handleClick = () => {
    if (mode === "link") {
      window.open(surveyUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setOpen(true);
  };

  /**
   * 모달 모드에서 iframe 로드 실패 대비
   * - 일정 시간(2초) 내 onLoad 이벤트가 오지 않으면 새 탭 열기 링크를 fallback으로 노출
   */
  useEffect(() => {
    if (!open || mode !== "modal") return;
    const timer = window.setTimeout(() => setShowIframeFallback(true), 2000);
    return () => window.clearTimeout(timer);
  }, [open, mode]);

  if (excluded) return null;

  return (
    <>
      {/* 데스크탑 탭 */}
      <button
        type='button'
        onClick={handleClick}
        aria-label={t("button")}
        className='fixed bottom-6 right-4 z-50 hidden md:flex items-center gap-2 rounded-full px-4 py-3 shadow-lg bg-slate-900 text-white hover:opacity-90 active:scale-95 transition'
      >
        <ClipboardList className='w-5 h-5' aria-hidden='true' />
        <span className='text-sm font-medium'>{t("button")}</span>
      </button>

      {/* 모바일 FAB */}
      <button
        type='button'
        onClick={handleClick}
        aria-label={t("button")}
        className='fixed bottom-5 right-4 z-50 md:hidden flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-slate-900 text-white hover:opacity-90 active:scale-95 transition'
      >
        <ClipboardList className='w-6 h-6' aria-hidden='true' />
      </button>

      {/* 모달 모드 */}
      {mode === "modal" && open && (
        <div
          role='dialog'
          aria-modal='true'
          className='fixed inset-0 z-[60] flex items-center justify-center'
        >
          <div
            className='absolute inset-0 bg-black/50'
            onClick={() => setOpen(false)}
          />
          <div className='relative z-[61] w-[92vw] max-w-3xl bg-background dark:bg-slate-900 rounded-2xl shadow-2xl p-4 md:p-5'>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='text-base md:text-lg font-semibold'>
                {t("modalTitle")}
              </h2>
              <button
                type='button'
                onClick={() => setOpen(false)}
                className='text-sm text-slate-600 hover:underline'
              >
                {t("close")}
              </button>
            </div>

            <div className='rounded-lg overflow-hidden border border-slate-200'>
              <iframe
                title={t("modalTitle")}
                src={surveyUrl}
                className='w-full h-[70vh] md:h-[65vh]'
                onLoad={() => setShowIframeFallback(false)}
              />
            </div>

            {showIframeFallback && (
              <div className='mt-3 text-right'>
                <a
                  href={surveyUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 text-sm underline'
                >
                  {t("openInNewTab")}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
