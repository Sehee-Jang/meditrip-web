import { db, auth } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type { AnswerItem } from "@/types/question";
import { toISO } from "@/utils/date";

/** 목록 */
export async function listAnswers(questionId: string): Promise<AnswerItem[]> {
  const aCol = collection(db, "questions", questionId, "answers");
  const snap = await getDocs(query(aCol, orderBy("createdAt", "asc")));
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      adminId: String(data.adminId ?? ""),
      content: String(data.content ?? ""),
      createdAt: toISO(data.createdAt),
      updatedAt: toISO(data.updatedAt),
    };
  });
}

/** 생성 */
export async function createAnswer(
  questionId: string,
  content: string
): Promise<void> {
  const adminId = auth.currentUser?.uid;
  if (!adminId) throw new Error("관리자 인증 필요");

  const qRef = doc(db, "questions", questionId);
  const aRef = doc(collection(qRef, "answers"));

  await runTransaction(db, async (tx) => {
    const qSnap = await tx.get(qRef);
    if (!qSnap.exists()) throw new Error("질문이 존재하지 않습니다.");

    tx.set(aRef, {
      adminId,
      content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const prev = Number(qSnap.data()?.answersCount ?? 0);
    tx.update(qRef, {
      answersCount: prev + 1,
      hasAnswer: true, // 항상 true
      updatedAt: serverTimestamp(),
      lastAnsweredAt: serverTimestamp(),
    });
  });
}

/** 수정 */
export async function updateAnswer(
  questionId: string,
  answerId: string,
  content: string
): Promise<void> {
  const aRef = doc(db, "questions", questionId, "answers", answerId);
  await updateDoc(aRef, { content, updatedAt: serverTimestamp() });
}

/** 삭제 */
export async function deleteAnswer(
  questionId: string,
  answerId: string
): Promise<void> {
  const qRef = doc(db, "questions", questionId);
  const aRef = doc(qRef, "answers", answerId);

  await runTransaction(db, async (tx) => {
    const qSnap = await tx.get(qRef);
    if (!qSnap.exists()) throw new Error("질문이 존재하지 않습니다.");

    tx.delete(aRef);

    const prev = Number(qSnap.data()?.answersCount ?? 0);
    const next = Math.max(prev - 1, 0);
    tx.update(qRef, {
      answersCount: next,
      hasAnswer: next > 0, // 0이면 false
      updatedAt: serverTimestamp(),
    });
  });
}
