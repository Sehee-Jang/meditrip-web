import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Question } from "@/types/question";
import { normalizeCommunityCategory } from "@/lib/communityCategory";
import { toISO } from "@/utils/date";

export async function getQuestionById(
  id: string,
  opts?: { includeHidden?: boolean }
): Promise<Question | null> {
  const ref = doc(db, "questions", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const x = snap.data() as Record<string, unknown>;
  const answersCount = typeof x.answersCount === "number" ? x.answersCount : 0;

  const hasAnswer =
    typeof x.hasAnswer === "boolean" ? x.hasAnswer : answersCount > 0;

  const q: Question = {
    id: snap.id,
    title: String(x.title ?? ""),
    content: String(x.content ?? ""),
    category: normalizeCommunityCategory(x.category),
    createdAt: toISO(x.createdAt),
    updatedAt: toISO(x.updatedAt) || toISO(x.createdAt),
    imageUrl: typeof x.imageUrl === "string" ? x.imageUrl : "",
    userId: typeof x.userId === "string" ? x.userId : "",
    answersCount,
    hasAnswer,
    isHidden: Boolean(x.isHidden ?? false),
    ...(x.lastAnsweredAt ? { lastAnsweredAt: toISO(x.lastAnsweredAt) } : {}),
  };

  // 공개용: 숨김 글이면 노출하지 않음
  if (!opts?.includeHidden && q.isHidden) return null;

  return q;
}
