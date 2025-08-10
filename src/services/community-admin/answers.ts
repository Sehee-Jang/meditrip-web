import { db, auth } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import type { AnswerItem } from "@/types/question";

const toISO = (ts?: Timestamp) =>
  ts ? ts.toDate().toISOString() : new Date().toISOString();

/** 답변 생성 */
export async function createAnswer(
  questionId: string,
  content: string
): Promise<string> {
  const adminId = auth.currentUser?.uid;
  if (!adminId) throw new Error("관리자 인증이 필요합니다.");

  const ref = await addDoc(collection(db, "questions", questionId, "answers"), {
    content,
    adminId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 질문의 집계 필드 증가
  await updateDoc(doc(db, "questions", questionId), {
    answersCount: increment(1),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

/** 답변 목록 */
export async function listAnswers(questionId: string): Promise<AnswerItem[]> {
  const q = query(
    collection(db, "questions", questionId, "answers"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      content: data.content ?? "",
      adminId: data.adminId ?? "",
      createdAt: toISO(data.createdAt),
      updatedAt: toISO(data.updatedAt),
    } as AnswerItem;
  });
}

/** 답변 수정 */
export async function updateAnswer(
  questionId: string,
  answerId: string,
  content: string
): Promise<void> {
  await updateDoc(doc(db, "questions", questionId, "answers", answerId), {
    content,
    updatedAt: serverTimestamp(),
  });
}

/** 답변 삭제(질문 answersCount 감소) */
export async function deleteAnswer(
  questionId: string,
  answerId: string
): Promise<void> {
  await deleteDoc(doc(db, "questions", questionId, "answers", answerId));
  await updateDoc(doc(db, "questions", questionId), {
    answersCount: increment(-1),
    updatedAt: serverTimestamp(),
  });
}
