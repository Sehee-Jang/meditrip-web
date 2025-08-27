// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

/** ① UI(라우팅)에서 실제로 활성화할 로케일들 — 메시지 번들이 있는 언어만 */
export const uiLocales = ["ko", "ja"] as const;
export type UiLocale = (typeof uiLocales)[number];

/** ② 콘텐츠(데이터)에서 허용할 로케일들 — 병원/패키지 다국어 필드용 */
export const contentLocales = ["ko", "ja", "en", "zh"] as const;
export type Locale = (typeof contentLocales)[number];

export const defaultLocale = "ko" as const;

/** next-intl 라우팅 설정은 'UI용 로케일'만 사용 */
export const routing = defineRouting({
  locales: [...uiLocales], // ← ko/ja만 활성화 (스프레드로 string[] 보장)
  defaultLocale,
  localePrefix: "always",
});

/** 런타임 유틸(선택) — 안전한 로케일 보정 */
export function isLocale(v: string): v is Locale {
  return (contentLocales as readonly string[]).includes(v);
}
export function toSupportedLocale(v: string | null | undefined): Locale {
  return v && isLocale(v) ? v : defaultLocale;
}
