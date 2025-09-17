import {
  TOUR_IMAGE_DEFAULT,
  TOUR_THEME_FALLBACK,
  type TourThemeCode,
} from "@/constants/tourTheme";
import type { TourListItem } from "@/types/kto-wellness";

/** 아이템 내부에서 테마 코드를 다양한 키로 시도하여 추출 */
function extractThemeCode(item: TourListItem): TourThemeCode | null {
  const candidates: Array<unknown> = [
    (item as unknown as { wellnessThemaCd?: unknown }).wellnessThemaCd,
    (item as unknown as { themaCode?: unknown }).themaCode,
    (item as unknown as { thema?: { code?: unknown } }).thema?.code,
    // 추가 후보들(어댑터에 따라 달라질 수 있음)
    (item as unknown as { theme?: unknown }).theme,
    (item as unknown as { categoryCode?: unknown }).categoryCode,
  ];

  for (const v of candidates) {
    if (typeof v === "string" && v in TOUR_THEME_FALLBACK) {
      return v as TourThemeCode;
    }
  }
  return null;
}

/** 카드 이미지 최종 결정: 원본 > 썸네일 > (아이템테마|힌트테마) > 공통기본 */
export function resolveTourImageSrc(
  item: TourListItem,
  hintCode?: TourThemeCode
): string {
  const original = item.image?.original;
  const thumb = item.image?.thumb;

  if (original && original.trim().length > 0) return original;
  if (thumb && thumb.trim().length > 0) return thumb;

  const fromItem = extractThemeCode(item);
  if (fromItem) return TOUR_THEME_FALLBACK[fromItem];

  if (hintCode && hintCode in TOUR_THEME_FALLBACK) {
    return TOUR_THEME_FALLBACK[hintCode];
  }

  return TOUR_IMAGE_DEFAULT;
}
