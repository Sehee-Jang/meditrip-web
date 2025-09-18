import { serverTimestamp, updateDoc } from "firebase/firestore";
import { ArticleStatus } from "@/types/articles";
import { articleDocRef } from "./collection";

export async function updateArticleStatus(
  id: string,
  status: ArticleStatus
): Promise<void> {
  await updateDoc(articleDocRef(id), { status, updatedAt: serverTimestamp() });
}
