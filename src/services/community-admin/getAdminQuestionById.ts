import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Question } from "@/types/question";

export async function getAdminQuestionById(
  id: string
): Promise<Question | null> {
  const ref = doc(db, "questions", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as Record<string, unknown>;

  const answersCount =
    typeof data.answersCount === "number" ? data.answersCount : 0;

  const hasAnswer =
    typeof data.hasAnswer === "boolean" ? data.hasAnswer : answersCount > 0;

  return {
    ...(data as Omit<Question, "id" | "answersCount" | "hasAnswer">),
    id: snap.id,
    answersCount,
    hasAnswer,
  } as Question;
}
