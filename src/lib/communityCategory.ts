import type { CommunityCategory, CommunityCategoryKey } from "@/types/category";
import { COMMUNITY_CATEGORY_KEYS } from "@/constants/communityCategories";

/** 문자열 키 집합(런타임 검증용) */
const CATEGORY_SET: ReadonlySet<string> = new Set(COMMUNITY_CATEGORY_KEYS);

/** 기본 폴백은 'etc' 권장 (미정의 키를 안전하게 수용) */
export const DEFAULT_COMMUNITY_CATEGORY: CommunityCategory = "etc";

/** Firestore 등에서 읽은 값을 CommunityCategory로 안전 변환 */
export function normalizeCommunityCategory(
  input: unknown,
  fallback: CommunityCategory = DEFAULT_COMMUNITY_CATEGORY
): CommunityCategory {
  const s = typeof input === "string" ? input : String(input ?? "");
  return CATEGORY_SET.has(s) ? (s as CommunityCategory) : fallback;
}

/** 런타임 타입가드: 키 유효성 검사 */
export function isCommunityCategoryKey(v: unknown): v is CommunityCategoryKey {
  return typeof v === "string" && CATEGORY_SET.has(v);
}
