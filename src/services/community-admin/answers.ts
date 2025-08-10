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
import type { AnswerItem, ReplyItem } from "@/types/question";

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
    repliesCount: 0,
  });

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
      repliesCount: Number(data.repliesCount ?? 0),
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

/** 답변 삭제(하위 답글도 함께 삭제 + 상위 카운트 감소) */
export async function deleteAnswer(
  questionId: string,
  answerId: string
): Promise<void> {
  // 하위 replies 전부 삭제
  const repliesQ = query(
    collection(db, "questions", questionId, "answers", answerId, "replies")
  );
  const repliesSnap = await getDocs(repliesQ);
  await Promise.all(
    repliesSnap.docs.map((r) =>
      deleteDoc(
        doc(db, "questions", questionId, "answers", answerId, "replies", r.id)
      )
    )
  );

  await deleteDoc(doc(db, "questions", questionId, "answers", answerId));

  await updateDoc(doc(db, "questions", questionId), {
    answersCount: increment(-1),
    updatedAt: serverTimestamp(),
  });
}

/** 답글 생성 */
export async function createReply(
  questionId: string,
  answerId: string,
  content: string
): Promise<string> {
  const adminId = auth.currentUser?.uid;
  if (!adminId) throw new Error("관리자 인증이 필요합니다.");

  const ref = await addDoc(
    collection(db, "questions", questionId, "answers", answerId, "replies"),
    {
      content,
      adminId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  await updateDoc(doc(db, "questions", questionId, "answers", answerId), {
    repliesCount: increment(1),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

/** 답글 목록 */
export async function listReplies(
  questionId: string,
  answerId: string
): Promise<ReplyItem[]> {
  const q = query(
    collection(db, "questions", questionId, "answers", answerId, "replies"),
    orderBy("createdAt", "asc")
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
    } as ReplyItem;
  });
}

/** 답글 수정 */
export async function updateReply(
  questionId: string,
  answerId: string,
  replyId: string,
  content: string
): Promise<void> {
  await updateDoc(
    doc(db, "questions", questionId, "answers", answerId, "replies", replyId),
    {
      content,
      updatedAt: serverTimestamp(),
    }
  );
}

/** 답글 삭제(상위 repliesCount 감소) */
export async function deleteReply(
  questionId: string,
  answerId: string,
  replyId: string
): Promise<void> {
  await deleteDoc(
    doc(db, "questions", questionId, "answers", answerId, "replies", replyId)
  );
  await updateDoc(doc(db, "questions", questionId, "answers", answerId), {
    repliesCount: increment(-1),
    updatedAt: serverTimestamp(),
  });
}
