import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
  QueryDocumentSnapshot,
  DocumentData,
  doc,
  getDoc,
} from "firebase/firestore";
import { Question } from "@/types/question";
import { User } from "@/types/user";

export interface QuestionPage {
  questions: Question[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}

/**
 * pageSize 개씩, cursor 다음 문서부터 불러오는 페이징 함수
 * totalCount는 반환하지 않습니다.
 */
export async function getQuestions(
  pageSize: number,
  cursor?: QueryDocumentSnapshot<DocumentData>
): Promise<QuestionPage> {
  const q = query(
    collection(db, "questions"),
    orderBy("createdAt", "desc"),
    limit(pageSize),
    ...(cursor ? [startAfter(cursor)] : [])
  );
  const snap = await getDocs(q);

  const questions: Question[] = await Promise.all(
    snap.docs.map(async (docSnap) => {
      const data = docSnap.data();
      let user: User | null = null;

      if (data.userId) {
        const userRef = doc(db, "users", data.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          user = userSnap.data() as User;
        }
      }

      return {
        id: docSnap.id,
        ...data,
        user,
      } as Question;
    })
  );

  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { questions, lastDoc };
}

/**
 * 전체 질문 개수만 빠르게 조회하는 함수
 */
export async function getQuestionsCount(): Promise<number> {
  const coll = collection(db, "questions");
  const snapshot = await getCountFromServer(coll);
  return snapshot.data().count;
}
