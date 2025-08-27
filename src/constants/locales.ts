export const LOCALES_TUPLE = ["ko", "ja", "zh", "en"] as const; // 언제든 뒤에 추가만 하면 됨
export type LocaleKey = (typeof LOCALES_TUPLE)[number];

export const LOCALE_LABELS_KO: Record<LocaleKey, string> = {
  ko: "한국어",
  ja: "일본어",
  zh: "중국어",
  en: "영어",
};

// 필수 언어(운영 정책에 맞춰 변경 가능)
// 필수 언어: 한국어 + 일본어 → 추후 ["ko", "ja","zh"]로 바꾸면 스키마가 자동 반영됨.
export const REQUIRED_LOCALES = ["ko", "ja"] as const;
