import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COL = "wellness";

export async function deleteWellness(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
