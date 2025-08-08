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
  Timestamp,
} from "firebase/firestore";
import { Question } from "@/types/question";
import { User } from "@/types/user";

export interface QuestionPage {
  questions: Question[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}

const toISO = (ts?: Timestamp) =>
  ts ? ts.toDate().toISOString() : new Date().toISOString();

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
      let user: User | undefined;

      if (data.userId) {
        const userRef = doc(db, "users", data.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) user = userSnap.data() as User;
      }

      return {
        id: docSnap.id,
        title: data.title ?? "",
        content: data.content ?? "",
        category: data.category ?? "etc",
        createdAt: toISO(data.createdAt),
        imageUrl: data.imageUrl ?? "",
        userId: data.userId ?? "",
        user,
        answers: Array.isArray(data.answers)
          ? data.answers.map(
              (a: {
                content: string;
                createdAt?: Timestamp;
                updatedAt?: Timestamp;
              }) => ({
                content: a.content,
                createdAt: toISO(a.createdAt),
                updatedAt: toISO(a.updatedAt),
              })
            )
          : [],
      } satisfies Question;
    })
  );

  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { questions, lastDoc };
}

export async function getQuestionsCount(): Promise<number> {
  const coll = collection(db, "questions");
  const snapshot = await getCountFromServer(coll);
  return snapshot.data().count;
}
