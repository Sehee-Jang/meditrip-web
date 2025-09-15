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
