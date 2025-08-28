import type { LocaleKey } from "@/constants/locales";
import { LOCALES_TUPLE } from "@/constants/locales";
import type {
  AmenityKey,
  ClinicCategory,
  DailyRange,
  DayOfWeek,
} from "@/types/clinic";

/** 요일 키 (UI 루프에 사용) */
export const DAY_KEYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;
export type DayKey = (typeof DAY_KEYS)[number];

/** 체크리스트 표기 순서(휴무일 UI) */
export const CLOSED_DAYS_ORDER = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;

/** HH:mm 템플릿 타입 및 가드 */
export type HHmm = `${number}${number}:${number}${number}`;
export const isHHmm = (v: unknown): v is HHmm =>
  typeof v === "string" && /^\d{2}:\d{2}$/.test(v);

/** 카테고리 안전 변환 */
const CATEGORY_VALUES: readonly ClinicCategory[] = [
  "traditional",
  "cosmetic",
  "wellness",
] as const;
export const asClinicCategory = (val: unknown): ClinicCategory | undefined =>
  CATEGORY_VALUES.includes(val as ClinicCategory)
    ? (val as ClinicCategory)
    : undefined;

/** 편의시설 키 집합 */
export const AMENITY_VALUES: readonly AmenityKey[] = [
  "parking",
  "freeWifi",
  "infoDesk",
  "privateCare",
  "airportPickup",
] as const;
export const isAmenityKey = (v: unknown): v is AmenityKey =>
  AMENITY_VALUES.includes(v as AmenityKey);
export const asAmenityKeys = (arr: unknown): AmenityKey[] => {
  const xs = Array.isArray(arr) ? (arr as unknown[]) : [];
  return xs.filter(isAmenityKey);
};

/** 빈 문자열 → undefined */
export const toUndef = (v: unknown) => {
  const s = typeof v === "string" ? v.trim() : v;
  return s === "" ? undefined : s;
};

/** 폼에서 쓰는 임시 타입 */
export type DailyRangeInForm = { open?: string; close?: string };
export type WeeklyHoursInForm = Partial<Record<DayKey, DailyRangeInForm[]>>;

/** weeklyHours: 각 요일 최소 1구간 보장(입력칸 표시 목적, 저장 시엔 정제) */
export const normalizeWeeklyHours = (raw: unknown): WeeklyHoursInForm => {
  const src = (raw ?? {}) as WeeklyHoursInForm;
  const out: WeeklyHoursInForm = {};
  DAY_KEYS.forEach((d) => {
    const list = Array.isArray(src[d]) ? (src[d] as DailyRangeInForm[]) : [];
    out[d] = list.length > 0 ? list : [{ open: "", close: "" }];
  });
  return out;
};

/** 로케일 문자열/배열 보정 */
export const ensureLocalizedStrings = (
  obj: unknown
): Record<LocaleKey, string> => {
  const src = (obj ?? {}) as Record<string, string>;
  const out = {} as Record<LocaleKey, string>;
  LOCALES_TUPLE.forEach((loc) => {
    out[loc] = typeof src[loc] === "string" ? src[loc] : "";
  });
  return out;
};
export const ensureLocalizedStringArrays = (
  obj: unknown,
  padTo?: number
): Record<LocaleKey, string[]> => {
  const src = (obj ?? {}) as Record<string, unknown>;
  const out: Record<LocaleKey, string[]> = {} as Record<LocaleKey, string[]>;
  LOCALES_TUPLE.forEach((loc) => {
    const arr = Array.isArray(src[loc]) ? (src[loc] as string[]) : [];
    out[loc] =
      typeof padTo === "number"
        ? arr.concat(Array(Math.max(0, padTo - arr.length)).fill(""))
        : arr;
  });
  return out;
};

/** amenities가 boolean map으로 저장된 과거 문서도 배열로 변환 */
export const normalizeAmenities = (raw: unknown): AmenityKey[] => {
  if (Array.isArray(raw)) {
    return (raw as unknown[]).filter(isAmenityKey);
  }
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const keys = Object.keys(obj).filter((k): k is AmenityKey =>
      isAmenityKey(k)
    );
    return keys.filter((k) => obj[k] === true);
  }
  return [];
};

/** 폼 weeklyHours → 문서 weeklyHours (DailyRange[]) */
export type WeeklyHoursFormLike = Partial<
  Record<DayKey, Array<{ open?: string; close?: string }>>
>;
export const toDocWeeklyHours = (
  src: WeeklyHoursFormLike
): Partial<Record<DayOfWeek, DailyRange[]>> => {
  const out: Partial<Record<DayOfWeek, DailyRange[]>> = {};
  DAY_KEYS.forEach((d) => {
    const list = Array.isArray(src?.[d]) ? src[d]! : [];
    const cleaned: DailyRange[] = list
      .map((r) => {
        const o = isHHmm(r?.open) ? (r.open as HHmm) : undefined;
        const c = isHHmm(r?.close) ? (r.close as HHmm) : undefined;
        return o && c ? ({ open: o, close: c } as DailyRange) : undefined;
      })
      .filter((v): v is DailyRange => !!v);
    if (cleaned.length > 0) out[d as DayOfWeek] = cleaned;
  });
  return out;
};
