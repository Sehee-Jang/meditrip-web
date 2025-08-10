import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import type { Question } from "@/types/question";

const toISO = (ts?: Timestamp) =>
  ts ? ts.toDate().toISOString() : new Date().toISOString();

export async function getAdminQuestionById(
  id: string
): Promise<Question | null> {
  const snap = await getDoc(doc(db, "questions", id));
  if (!snap.exists()) return null;

  const data = snap.data();

  const q: Question = {
    id: snap.id,
    title: data.title ?? "",
    content: data.content ?? "",
    category: data.category,
    createdAt: toISO(data.createdAt),
    imageUrl: data.imageUrl ?? "",
    userId: data.userId ?? "",
    answersCount: Number(data.answersCount ?? 0),
    isHidden: Boolean(data.isHidden ?? false),
  };

  return q;
}
