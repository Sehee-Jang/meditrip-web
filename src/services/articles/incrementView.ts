import { updateDoc, increment } from "firebase/firestore";
import { articleDocRef } from "./collection";

export async function incrementView(articleId: string): Promise<void> {
  if (!articleId || typeof window === "undefined") return;

  const key = `viewed:article:${articleId}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");

  await updateDoc(articleDocRef(articleId), { viewCount: increment(1) });
}
