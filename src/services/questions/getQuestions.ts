import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { Question } from "@/types/Question";

export interface QuestionPage {
  questions: Question[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  totalCount: number;
}

/**
 * pageSize 개씩, cursor 다음 문서부터 불러오는 페이징 함수
 */
export async function getQuestions(
  pageSize: number,
  cursor?: QueryDocumentSnapshot<DocumentData>
): Promise<QuestionPage> {
  // 전체 개수 가져오기
  const totalSnap = await getDocs(collection(db, "questions"));
  const totalCount = totalSnap.size;

  // 페이징 쿼리: cursor가 있으면 startAfter(cursor) 추가
  const q = query(
    collection(db, "questions"),
    orderBy("createdAt", "desc"),
    limit(pageSize),
    ...(cursor ? [startAfter(cursor)] : [])
  );
  const snap = await getDocs(q);

  const questions = snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as any),
  })) as Question[];

  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { questions, lastDoc, totalCount };
}
