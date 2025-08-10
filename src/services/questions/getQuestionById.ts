import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import type { Question } from "@/types/question";

const toISO = (ts?: Timestamp) =>
  ts ? ts.toDate().toISOString() : new Date().toISOString();

export async function getQuestionById(
  id: string,
  opts?: { includeHidden?: boolean }
): Promise<Question | null> {
  const ref = doc(db, "questions", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const x = snap.data();

  const q: Question = {
    id: snap.id,
    title: x.title ?? "",
    content: x.content ?? "",
    category: x.category,
    createdAt: toISO(x.createdAt),
    updatedAt: toISO(x.updatedAt),
    imageUrl: x.imageUrl ?? "",
    userId: x.userId ?? "",
    answersCount: Number(x.answersCount ?? 0),
    isHidden: Boolean(x.isHidden ?? false),
  };

  // 공개용: 숨김 글이면 노출하지 않음
  if (q.isHidden) return null;
  if (!opts?.includeHidden && q.isHidden) return null;

  return q;
}
