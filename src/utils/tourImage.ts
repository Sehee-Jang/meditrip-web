import {
  TOUR_IMAGE_DEFAULT,
  TOUR_THEME_FALLBACK,
  type TourThemeCode,
} from "@/constants/tourTheme";

// 이미지 필드만 요구(옵셔널)
type ImageLike = { image?: { original?: string; thumb?: string } };

// 다양한 어댑터 케이스 고려해 테마 후보 키를 포괄
type ThemeLike =
  | { wellnessThemaCd?: string }
  | { themaCode?: string }
  | { thema?: { code?: string } }
  | { theme?: string }
  | { categoryCode?: string };

// 최소 요구 형태: 이미지 + (있을 수도 있는) 테마 정보
export type TourListLike = ImageLike & Partial<ThemeLike>;

function extractThemeCode(item: TourListLike): TourThemeCode | null {
  const candidates: Array<unknown> = [
    (item as { wellnessThemaCd?: unknown }).wellnessThemaCd,
    (item as { themaCode?: unknown }).themaCode,
    (item as { thema?: { code?: unknown } }).thema?.code,
    (item as { theme?: unknown }).theme,
    (item as { categoryCode?: unknown }).categoryCode,
  ];

  for (const v of candidates) {
    if (typeof v === "string" && v in TOUR_THEME_FALLBACK) {
      return v as TourThemeCode;
    }
  }
  return null;
}

/** 카드 이미지 최종 결정: 원본 > 썸네일 > (아이템테마|힌트테마) > 공통기본 */
export function resolveTourImageSrc<T extends TourListLike>(
  item: T,
  hintCode?: TourThemeCode
): string {
  const original = item.image?.original?.trim();
  const thumb = item.image?.thumb?.trim();

  if (original) return original;
  if (thumb) return thumb;

  const fromItem = extractThemeCode(item);
  if (fromItem) return TOUR_THEME_FALLBACK[fromItem];

  if (hintCode && hintCode in TOUR_THEME_FALLBACK) {
    return TOUR_THEME_FALLBACK[hintCode];
  }
  return TOUR_IMAGE_DEFAULT;
}
