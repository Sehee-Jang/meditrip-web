import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getQuestionById(id: string) {
  const ref = doc(db, "questions", id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) throw new Error("질문이 존재하지 않습니다.");
  return { id: snapshot.id, ...snapshot.data() };
}
