import type { Locale } from "@/types/clinic";

export function formatPrice(locale: Locale, amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const f = n.toLocaleString(locale === "ko" ? "ko-KR" : "ja-JP");
  return locale === "ko" ? `${f}원` : `${f}円`;
}

export function formatDuration(locale: Locale, minutes: number): string {
  const n = Number.isFinite(minutes) ? minutes : 0;
  const f = n.toLocaleString(locale === "ko" ? "ko-KR" : "ja-JP");
  return locale === "ko" ? `${f}분` : `${f}分`;
}
