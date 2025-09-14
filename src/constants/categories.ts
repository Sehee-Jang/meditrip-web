import type { LucideIcon } from "lucide-react";
import {
  Brain,
  ShieldCheck,
  Hourglass,
  CircleEllipsis,
  BookHeart,
} from "lucide-react";

export const CATEGORIES = {
  stress: "stress",
  // diet: "diet",
  immunity: "immunity",
  // women: "women",
  antiaging: "antiaging",
  therapy: "therapy",
  etc: "etc",
} as const;

export const CATEGORY_VALUES_TUPLE = [
  CATEGORIES.stress,
  // CATEGORIES.diet,
  CATEGORIES.immunity,
  // CATEGORIES.women,
  CATEGORIES.antiaging,
  CATEGORIES.therapy,
  CATEGORIES.etc,
] as const;

export type CategoryKey = keyof typeof CATEGORIES;

// 값 유니언(미래에 value가 key와 달라져도 안전)
export type Category = (typeof CATEGORIES)[CategoryKey];

// Zod 등에서 필요한 튜플/배열도 한 번에 제공
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];
export const CATEGORY_VALUES = Object.values(CATEGORIES) as Category[];

// 아이콘 매핑: React.ElementType 대신 LucideIcon으로 구체화
export const CATEGORY_ICONS: Record<CategoryKey, LucideIcon> = {
  stress: Brain,
  // diet: Salad,
  immunity: ShieldCheck,
  // women: Stethoscope,
  antiaging: Hourglass,
  therapy: BookHeart,
  etc: CircleEllipsis,
};

export const CATEGORY_LABELS_KO: Record<CategoryKey, string> = {
  stress: "멘탈·스트레스 관리",
  // diet: "다이어트&디톡스",
  immunity: "체력·면역 관리",
  // women: "여성질환",
  antiaging: "안티에이징·뷰티",
  therapy: "종합 테라피",
  etc: "그 외",
};

export function getCategoryLabelKo(key: CategoryKey): string {
  return CATEGORY_LABELS_KO[key] ?? key;
}
