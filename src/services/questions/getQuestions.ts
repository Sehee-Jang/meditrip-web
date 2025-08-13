import {
  collection,
  getDocs,
  orderBy,
  limit,
  query,
  startAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Question } from "@/types/question";

export async function getQuestions(
  pageSize: number,
  cursor?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  questions: Question[];
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}> {
  const col = collection(db, "questions"); // 컬렉션 경로 확인!
  const base = query(col, orderBy("createdAt", "desc"), limit(pageSize));
  const q = cursor
    ? query(
        col,
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(pageSize)
      )
    : base;

  const snap = await getDocs(q);
  const items: Question[] = snap.docs.map((d) => {
    const data = d.data() as Omit<Question, "id">;
    return { id: d.id, ...data };
  });
  const lastDoc = snap.docs[snap.docs.length - 1];
  return { questions: items, lastDoc };
}

export async function getQuestionsCount(): Promise<number> {
  const col = collection(db, "questions"); // 컬렉션 경로 확인!
  const agg = await getCountFromServer(col);
  return agg.data().count;
}
