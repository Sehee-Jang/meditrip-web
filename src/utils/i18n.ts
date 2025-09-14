import { defaultLocale, contentLocales, type Locale } from "@/i18n/routing";

export function isLocale(v: string): v is Locale {
  return (contentLocales as readonly string[]).includes(v);
}

export function toSupportedLocale(v: string | null | undefined): Locale {
  return v && isLocale(v) ? v : defaultLocale;
}

/** Localized<T>에서 안전하게 값 꺼내기 (locale → defaultLocale → 첫 가용값) */
export function pickLocalized<T>(
  map: Partial<Record<Locale, T>> | null | undefined,
  locale: Locale,
  fallbacks: readonly Locale[] = [defaultLocale]
): T | undefined {
  // 1) 요청 locale
  const v1 = map?.[locale];
  if (v1 !== undefined && v1 !== null) return v1;

  // 2) 지정 폴백 체인
  for (const fb of fallbacks) {
    const v = map?.[fb];
    if (v !== undefined && v !== null) return v;
  }

  // 3) 마지막 수단: 어떤 언어든 첫 값
  if (map) {
    for (const v of Object.values(map)) {
      if (v !== undefined && v !== null) return v;
    }
  }
  return undefined;
}

export function pickText(
  map: Partial<Record<Locale, string>> | null | undefined,
  locale: Locale,
  fallbackText = ""
): string {
  return pickLocalized<string>(map, locale) ?? fallbackText;
}
