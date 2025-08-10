import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import type { CommunityCategory } from "@/types/category";
import type { Question } from "@/types/question";

export interface AdminQuestionFilter {
  category?: CommunityCategory | "all";
  visibility?: "all" | "visible" | "hidden";
  answered?: "all" | "yes" | "no";
}

export interface AdminQuestionPage {
  items: Question[];
  cursor: QueryDocumentSnapshot<DocumentData> | null;
}

const toISO = (ts?: Timestamp) =>
  ts ? ts.toDate().toISOString() : new Date().toISOString();

export async function getAdminQuestions(
  pageSize: number,
  filter: AdminQuestionFilter,
  cursor?: QueryDocumentSnapshot<DocumentData>
): Promise<AdminQuestionPage> {
  const q = query(
    collection(db, "questions"),
    ...(filter.category && filter.category !== "all"
      ? [where("category", "==", filter.category)]
      : []),
    ...(filter.visibility === "visible"
      ? [where("isHidden", "==", false)]
      : []),
    ...(filter.visibility === "hidden" ? [where("isHidden", "==", true)] : []),
    ...(filter.answered === "yes" ? [where("answersCount", ">", 0)] : []),
    ...(filter.answered === "no" ? [where("answersCount", "==", 0)] : []),
    orderBy("createdAt", "desc"),
    limit(pageSize),
    ...(cursor ? [startAfter(cursor)] : [])
  );

  const snap = await getDocs(q);

  const items: Question[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title ?? "",
      content: data.content ?? "",
      category: data.category,
      createdAt: toISO(data.createdAt),
      imageUrl: data.imageUrl ?? "",
      userId: data.userId ?? "",
      answersCount: Number(data.answersCount ?? 0),
      isHidden: Boolean(data.isHidden ?? false),
    } satisfies Question;
  });

  return { items, cursor: snap.docs.at(-1) ?? null };
}
