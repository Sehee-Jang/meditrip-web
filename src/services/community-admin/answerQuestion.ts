import { db, auth } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  increment,
} from "firebase/firestore";

export async function answerQuestion(
  questionId: string,
  content: string
): Promise<void> {
  const adminId = auth.currentUser?.uid;
  if (!adminId) throw new Error("관리자 인증 필요");

  const ref = doc(db, "questions", questionId);
  await updateDoc(ref, {
    answers: arrayUnion({
      content,
      createdAt: serverTimestamp(),
      adminId,
    }),
    answersCount: increment(1),
    updatedAt: serverTimestamp(),
  });
}
