import { CATEGORIES, CATEGORY_ICONS } from "@/constants/categories";
import type { CategoryKey } from "@/constants/categories";
import type { LucideIcon } from "lucide-react";
import { Ellipsis } from "lucide-react";

/** 기존 카테고리 + etc (커뮤니티 전용) */
export const COMMUNITY_CATEGORIES = {
  ...(CATEGORIES as typeof CATEGORIES),
  etc: "etc",
} as const;

export type CommunityCategoryKey = CategoryKey | "etc";
export type CommunityCategory = (typeof CATEGORIES)[CategoryKey] | "etc";

export const COMMUNITY_CATEGORY_KEYS = [
  ...(Object.keys(CATEGORIES) as CategoryKey[]),
  "etc",
] as CommunityCategoryKey[];

export const COMMUNITY_CATEGORY_VALUES = [
  ...(Object.values(CATEGORIES) as CommunityCategory[]),
  "etc",
] as CommunityCategory[];

// 아이콘도 기존 + etc
export const COMMUNITY_CATEGORY_ICONS: Record<
  CommunityCategoryKey,
  LucideIcon
> = {
  ...(CATEGORY_ICONS as Record<CategoryKey, LucideIcon>),
  etc: Ellipsis,
};
