import type { JSONContent } from "@tiptap/core";
import { LocaleKey } from "@/constants/locales";
import type { Locale } from "@/i18n/routing";

// 모든 언어가 채워져 있지 않아도 되도록 Partial
export type Localized<T> = Partial<Record<Locale, T>>;

// 텍스트 전용 축약형
export type LocalizedText = Localized<string>;

// 다국어 문서 형태
export type LocalizedTextDoc = Record<LocaleKey, string>;
export type LocalizedStringArray = Record<LocaleKey, string[]>;
export type LocalizedRichTextDoc = Record<LocaleKey, JSONContent>;

export interface LocalizedNumber {
  ko: number; // KRW 금액 또는 분
  ja: number; // JPY 금액 또는 분
}
