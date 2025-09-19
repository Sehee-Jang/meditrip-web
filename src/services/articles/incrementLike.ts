import { updateDoc, increment } from "firebase/firestore";
import { articleDocRef } from "./collection";

export async function incrementWellnessLike(id: string): Promise<void> {
  await updateDoc(articleDocRef(id), { likeCount: increment(1) });
}
