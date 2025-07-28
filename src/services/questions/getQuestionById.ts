import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Question } from "@/types/Question";
import { Timestamp } from "firebase/firestore";

// Firestore Timestamp 대응
type FirestoreTimestamp = { toDate: () => Date };

export async function getQuestionById(id: string): Promise<Question> {
  const ref = doc(db, "questions", id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) throw new Error("질문을 찾을 수 없습니다.");

  const data = snapshot.data();

  const rawCreatedAt = data.createdAt;

  const createdAt =
    rawCreatedAt && typeof rawCreatedAt.seconds === "number"
      ? Timestamp.fromMillis(
          rawCreatedAt.seconds * 1000 +
            Math.floor(rawCreatedAt.nanoseconds / 1_000_000)
        )
      : Timestamp.now();

  return {
    id: snapshot.id,
    title: data.title ?? "제목 없음",
    content: data.content ?? "",
    category: data.category ?? "uncategorized",
    createdAt,
    imageUrl: data.imageUrl ?? "",
    userId: data.userId ?? "",
    user: data.user ?? { id: "", name: "익명" },
    answers: Array.isArray(data.answers) ? data.answers : [],
  };
}
