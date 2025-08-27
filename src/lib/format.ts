import type { LocaleKey } from "@/constants/locales";

/** 숫자 포맷용 BCP-47 태그 매핑 */
const NUMBER_LOCALE_TAG: Readonly<Record<LocaleKey, string>> = {
  ko: "ko-KR",
  ja: "ja-JP",
  en: "en-US",
  zh: "zh-CN", // 필요 시 'zh-TW' 등으로 조정 가능
} as const;

/** 금액 단위(접미사) 기본값
 *  - ko: "원", ja: "円"
 *  - en/zh: 기본 "KRW" (정책/요구에 맞게 원하는 통화 코드나 기호로 바꿔도 됨)
 *    → 예: 중국어에서 '韩元'을 원하면 아래 zh 값을 '韩元'으로 바꾸세요.
 */
const PRICE_UNIT_DEFAULT: Readonly<Record<LocaleKey, string>> = {
  ko: "원",
  ja: "円",
  en: "KRW",
  zh: "KRW",
} as const;

/** 시간 단위(접미사) 기본값 */
const DURATION_UNIT_DEFAULT: Readonly<Record<LocaleKey, string>> = {
  ko: "분",
  ja: "分",
  en: "min",
  zh: "分钟",
} as const;

/** 선택 옵션(단위 커스터마이즈 등) */
export interface FormatOptions {
  /** 금액 단위 오버라이드: 일부 로케일만 바꾸고 싶을 때 사용 */
  priceUnitOverride?: Partial<Record<LocaleKey, string>>;
  /** 시간 단위 오버라이드 */
  durationUnitOverride?: Partial<Record<LocaleKey, string>>;
}

/** 금액 포맷터: LocaleKey 전체 허용 */
export function formatPrice(
  locale: LocaleKey,
  amount: number,
  options?: FormatOptions
): string {
  const tag = NUMBER_LOCALE_TAG[locale] ?? NUMBER_LOCALE_TAG.ko;
  const n = Number.isFinite(amount) ? amount : 0;
  const formatted = n.toLocaleString(tag);

  const unitMap = {
    ...PRICE_UNIT_DEFAULT,
    ...(options?.priceUnitOverride ?? {}),
  };
  const unit = unitMap[locale] ?? unitMap.ko;

  // 영문/중문은 보통 숫자와 단위 사이 공백을 둠
  const needsSpace = locale === "en" || locale === "zh";
  return needsSpace ? `${formatted} ${unit}` : `${formatted}${unit}`;
}

/** 시간(분) 포맷터: LocaleKey 전체 허용 */
export function formatDuration(
  locale: LocaleKey,
  minutes: number,
  options?: FormatOptions
): string {
  const tag = NUMBER_LOCALE_TAG[locale] ?? NUMBER_LOCALE_TAG.ko;
  const n = Number.isFinite(minutes) ? minutes : 0;
  const formatted = n.toLocaleString(tag);

  const unitMap = {
    ...DURATION_UNIT_DEFAULT,
    ...(options?.durationUnitOverride ?? {}),
  };
  const unit = unitMap[locale] ?? unitMap.ko;

  const needsSpace = locale === "en"; // en은 보통 공백
  return needsSpace ? `${formatted} ${unit}` : `${formatted}${unit}`;
}

// import type { LocaleKey } from "@/constants/locales";
// import { REQUIRED_LOCALES } from "@/constants/locales";

// // 지금 정책상 "필수 언어"는 ko/ja → 타입도 그 집합으로 한정
// export type PriceLocale = (typeof REQUIRED_LOCALES)[number]; // "ko" | "ja"

// // LocaleKey(ko/ja/zh/en) → PriceLocale(ko/ja)로 안전 변환
// export function toPriceLocale(locale: LocaleKey): PriceLocale {
//   // REQUIRED_LOCALES가 ["ko","ja"]라면 여기에 걸림
//   if ((REQUIRED_LOCALES as readonly string[]).includes(locale)) {
//     return locale as PriceLocale;
//   }
//   // zh/en 등은 우선 ko로 폴백(정책에 맞게 조정 가능)
//   return "ko";
// }

// export function formatPrice(locale: PriceLocale, amount: number): string {
//   const n = Number.isFinite(amount) ? amount : 0;
//   const f = n.toLocaleString(locale === "ko" ? "ko-KR" : "ja-JP");
//   return locale === "ko" ? `${f}원` : `${f}円`;
// }

// export function formatDuration(locale: PriceLocale, minutes: number): string {
//   const n = Number.isFinite(minutes) ? minutes : 0;
//   const f = n.toLocaleString(locale === "ko" ? "ko-KR" : "ja-JP");
//   return locale === "ko" ? `${f}분` : `${f}分`;
// }

// /* (선택) 호출 편의를 위한 오버로드:
//    LocaleKey(ko/ja/zh/en)를 받아도 자동 변환해서 동작 */
// export function formatPriceFromLocaleKey(locale: LocaleKey, amount: number): string {
//   return formatPrice(toPriceLocale(locale), amount);
// }

// export function formatDurationFromLocaleKey(locale: LocaleKey, minutes: number): string {
//   return formatDuration(toPriceLocale(locale), minutes);
// }
