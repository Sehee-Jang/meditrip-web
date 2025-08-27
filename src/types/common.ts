import type { Locale } from "@/i18n/routing";

// 모든 언어가 채워져 있지 않아도 되도록 Partial
export type Localized<T> = Partial<Record<Locale, T>>;

// 텍스트 전용 축약형
export type LocalizedText = Localized<string>;
