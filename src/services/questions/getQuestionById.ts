import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Question } from "@/types/Question";

// Firestore Timestamp 대응
type FirestoreTimestamp = { toDate: () => Date };

export async function getQuestionById(id: string): Promise<Question> {
  const ref = doc(db, "questions", id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) throw new Error("질문을 찾을 수 없습니다.");

  const data = snapshot.data();

  return {
    id: snapshot.id,
    title: data.title ?? "제목 없음",
    content: data.content ?? "",
    category: data.category ?? "uncategorized",
    createdAt: data.createdAt as FirestoreTimestamp,
    imageUrl: data.imageUrl ?? "",
    userId: data.userId ?? "",
    user: data.user ?? { id: "", name: "익명" },
    answers: Array.isArray(data.answers) ? data.answers : [],
  };
}
