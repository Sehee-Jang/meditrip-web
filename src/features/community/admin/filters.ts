import { CATEGORY_KEYS, CategoryKey } from "@/constants/categories";

export type AnswerFilter = "all" | "yes" | "no";
export type VisibilityFilter = "all" | "visible" | "hidden";
export type CategoryFilter = "all" | CategoryKey;

export type AdminFilter = {
  category: CategoryFilter;
  answered: AnswerFilter;
  visibility: VisibilityFilter;
};

// URL(searchParams) 원본 타입 - Next.js 15.1에서는 Promise로 감싸져 옴
export type AdminFilterSearchParams = {
  category?: string | string[];
  answered?: string | string[];
  visibility?: string | string[];
};

const ANSWER_SET = ["all", "yes", "no"] as const;
const VISIBILITY_SET = ["all", "visible", "hidden"] as const;

function pickFirst(v?: string | string[]): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function toCategoryFilter(v?: string): CategoryFilter {
  if (!v || v === "all") return "all";
  return (CATEGORY_KEYS as readonly string[]).includes(v)
    ? (v as CategoryKey)
    : "all";
}

function toAnsweredFilter(v?: string): AnswerFilter {
  return (ANSWER_SET as readonly string[]).includes(v ?? "")
    ? (v as AnswerFilter)
    : "all";
}

function toVisibilityFilter(v?: string): VisibilityFilter {
  return (VISIBILITY_SET as readonly string[]).includes(v ?? "")
    ? (v as VisibilityFilter)
    : "all";
}

/** URL의 searchParams를 화면 상태에서 쓰기 좋은 AdminFilter로 정규화 */
export function parseAdminFilterFromSearchParams(
  sp: AdminFilterSearchParams
): AdminFilter {
  const category = toCategoryFilter(pickFirst(sp.category));
  const answered = toAnsweredFilter(pickFirst(sp.answered));
  const visibility = toVisibilityFilter(pickFirst(sp.visibility));
  return { category, answered, visibility };
}

/** 선택적으로 URL 쿼리로 되돌릴 때 사용 (필요 시) */
export function toQueryObject(filter: AdminFilter): Record<string, string> {
  const q: Record<string, string> = {};
  if (filter.category !== "all") q.category = filter.category;
  if (filter.answered !== "all") q.answered = filter.answered;
  if (filter.visibility !== "all") q.visibility = filter.visibility;
  return q;
}
