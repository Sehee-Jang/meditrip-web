import { db } from "@/lib/firebase";
import {
  getDocs,
  collection,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { Question } from "@/types/question";
import { User } from "@/types/user";

const toISO = (ts?: Timestamp) =>
  ts ? ts.toDate().toISOString() : new Date().toISOString();

export async function getAllQuestions(): Promise<Question[]> {
  const snapshot = await getDocs(collection(db, "questions"));

  const questions = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      let user: User | undefined;

      if (data.userId) {
        const userSnap = await getDoc(doc(db, "users", data.userId));
        if (userSnap.exists()) {
          user = userSnap.data() as User;
        }
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

  return questions;
}
