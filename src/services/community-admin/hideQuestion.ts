import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function setQuestionHidden(
  questionId: string,
  hidden: boolean
): Promise<void> {
  await updateDoc(doc(db, "questions", questionId), { isHidden: hidden });
}
