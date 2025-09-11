import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COL = "wellness";

export async function incrementWellnessView(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { viewCount: increment(1) });
}
