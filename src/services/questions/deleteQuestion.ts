import { db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export async function deleteQuestion(id: string) {
  const docRef = doc(db, "questions", id);
  await deleteDoc(docRef);
}
