import {
  getDocs,
  orderBy,
  query,
  where,
  limit as fsLimit,
  startAfter,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import type { Article } from "@/types/articles";
import type { CategoryKey } from "@/constants/categories";
import { mapSnapToArticle } from "./mapArticles";
import { articlesColRef } from "./collection";

export type ListOptions = {
  limit?: number; // 기본 12
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
  category?: CategoryKey | "all";
  includeHidden?: boolean; // 관리자 전용 true
  order?: "latest" | "popular"; // 최신/인기(좋아요)
};

export type ListResult = {
  items: Article[];
  cursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
};

export async function listArticles(
  opts: ListOptions = {}
): Promise<ListResult> {
  const {
    limit = 12,
    cursor = null,
    category = "all",
    order = "latest",
  } = opts;

  const col = articlesColRef();
  const qc: QueryConstraint[] = [];

  if (category !== "all") qc.push(where("category", "==", category));

  if (order === "popular") {
    qc.push(orderBy("likeCount", "desc"), orderBy("createdAt", "desc"));
  } else {
    qc.push(orderBy("createdAt", "desc"));
  }

  if (cursor) qc.push(startAfter(cursor));
  qc.push(fsLimit(limit + 1)); // +1로 hasMore 판단

  const snap = await getDocs(query(col, ...qc));
  const docs = snap.docs;
  const hasMore = docs.length > limit;
  const pageDocs = hasMore ? docs.slice(0, limit) : docs;

  return {
    items: pageDocs.map(mapSnapToArticle),
    cursor: pageDocs.length ? pageDocs[pageDocs.length - 1] : null,
    hasMore,
  };
}
