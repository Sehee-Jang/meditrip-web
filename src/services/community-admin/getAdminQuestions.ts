import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  startAfter,
  limit as limitFn,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Question } from "@/types/question";
import type { CommunityCategoryKey } from "@/types/category";
import { toISO } from "@/utils/date";
import { normalizeCommunityCategory } from "@/lib/communityCategory";

export type AdminQuestionFilter = {
  category: "all" | CommunityCategoryKey;
  answered: "all" | "yes" | "no";
  visibility: "all" | "visible" | "hidden";
};

export interface AdminQuestionListResult {
  items: Question[];
  cursor: QueryDocumentSnapshot<DocumentData> | null;
}

export async function getAdminQuestions(
  pageSize: number,
  filter: AdminQuestionFilter,
  cursor?: QueryDocumentSnapshot<DocumentData>
): Promise<AdminQuestionListResult> {
  const base = collection(db, "questions");
  const conds: QueryConstraint[] = [];

  // 카테고리
  if (filter.category !== "all") {
    conds.push(where("category", "==", filter.category));
  }

  // 노출 상태
  if (filter.visibility === "visible")
    conds.push(where("isHidden", "==", false));
  else if (filter.visibility === "hidden")
    conds.push(where("isHidden", "==", true));

  // 답변 여부 (hasAnswer 불리언으로 필터)
  if (filter.answered === "yes") conds.push(where("hasAnswer", "==", true));
  else if (filter.answered === "no")
    conds.push(where("hasAnswer", "==", false));

  // 정렬 + 페이지네이션
  conds.push(orderBy("createdAt", "desc"));
  if (cursor) conds.push(startAfter(cursor));
  conds.push(limitFn(pageSize));

  const snap = await getDocs(query(base, ...conds));

  const items: Question[] = snap.docs.map((d) => {
    const raw = d.data() as Record<string, unknown>;

    const answersCount =
      typeof raw.answersCount === "number" ? raw.answersCount : 0;
    const hasAnswer =
      typeof raw.hasAnswer === "boolean" ? raw.hasAnswer : answersCount > 0;

    return {
      id: d.id,
      title: String(raw.title ?? ""),
      content: String(raw.content ?? ""),
      category: normalizeCommunityCategory(raw.category),
      createdAt: toISO(raw.createdAt), // string
      updatedAt: toISO(raw.updatedAt), // string
      imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : "",
      userId: typeof raw.userId === "string" ? raw.userId : "",
      isHidden: Boolean(raw.isHidden ?? false),
      answersCount,
      hasAnswer,
    } satisfies Question;
  });

  const next =
    snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null;

  return { items, cursor: next };
}
