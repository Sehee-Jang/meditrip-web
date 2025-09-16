import type { Article } from "@/types/articles";

/** listArticles의 반환값이 배열 또는 { items: Article[] } 형태 모두를 안전하게 배열로 정규화 */
export function normalizeArticles(input: unknown): Article[] {
  // case 1: 이미 배열
  if (Array.isArray(input)) {
    return input.filter((v): v is Article =>
      Boolean(v && typeof v === "object" && "id" in v)
    );
  }

  // case 2: ListResult 같이 items를 가진 객체
  if (input && typeof input === "object" && "items" in input) {
    const items = (input as { items?: unknown }).items;
    if (Array.isArray(items)) {
      return items.filter((v): v is Article =>
        Boolean(v && typeof v === "object" && "id" in v)
      );
    }
  }

  return [];
}

export function titleFor(a: Article, locale: keyof Article["title"]): string {
  return a.title?.[locale] || a.title?.ko || "제목 없음";
}
export function excerptFor(
  a: Article,
  locale: keyof Article["excerpt"]
): string {
  return a.excerpt?.[locale] || a.excerpt?.ko || "";
}
export function viewsOf(a: Article): number {
  return (a as { views?: number }).views ?? 0;
}
export function createdAtOf(a: Article): Date | null {
  const raw = (a as { createdAt?: string | number | Date })?.createdAt;
  return raw ? new Date(raw) : null;
}
export function sortByCreatedAtDesc<T extends Article>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const an = createdAtOf(a)?.getTime() ?? 0;
    const bn = createdAtOf(b)?.getTime() ?? 0;
    return bn - an;
  });
}