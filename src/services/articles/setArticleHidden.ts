import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COL = "wellness";

export async function setArticleHidden(
  id: string,
  isHidden: boolean
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    isHidden,
    updatedAt: serverTimestamp(),
  });
}
