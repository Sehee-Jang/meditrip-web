import {
  collection,
  getDocs,
  getCountFromServer,
  orderBy,
  query,
  startAfter,
  limit as limitFn,
  where,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Question } from "@/types/question";

type PageResult = {
  questions: Question[];
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
};

// Firestore 문서에 저장된 순수 도큐먼트 타입
type QuestionDoc = Omit<Question, "id">;

export async function getQuestions(
  pageSize: number,
  cursor?: QueryDocumentSnapshot<DocumentData>
): Promise<PageResult> {
  const base = [
    where("isHidden", "==", false),
    orderBy("createdAt", "desc"),
    limitFn(pageSize),
  ];

  const q = cursor
    ? query(
        collection(db, "questions"),
        where("isHidden", "==", false),
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limitFn(pageSize)
      )
    : query(collection(db, "questions"), ...base);

  const snap = await getDocs(q);

  const questions: Question[] = snap.docs.map((d) => {
    const data = d.data() as QuestionDoc; // id가 없는 타입으로 캐스팅
    return { ...data, id: d.id }; // 마지막에 id를 주입
  });
  const lastDoc = snap.docs[snap.docs.length - 1];

  return { questions, lastDoc };
}

export async function getQuestionsCount(): Promise<number> {
  const q = query(collection(db, "questions"), where("isHidden", "==", false));
  const snap = await getCountFromServer(q);
  return Number(snap.data().count ?? 0);
}
