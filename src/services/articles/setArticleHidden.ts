import { updateDoc, serverTimestamp } from "firebase/firestore";
import { articleDocRef } from "./collection";

export async function setArticleHidden(
  id: string,
  isHidden: boolean
): Promise<void> {
  await updateDoc(articleDocRef(id), {
    isHidden,
    updatedAt: serverTimestamp(),
  });
}
