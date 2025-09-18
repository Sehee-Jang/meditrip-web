import { deleteDoc } from "firebase/firestore";
import { articleDocRef } from "./collection";

export async function deleteArticle(id: string): Promise<void> {
  await deleteDoc(articleDocRef(id));
}
