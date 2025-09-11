import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UpdateArticleInput } from "@/types/articles";
import { mapUpdateInputToDoc } from "./mapWellness";

const COL = "wellness";

export async function updateWellness(
  id: string,
  patch: UpdateArticleInput
): Promise<void> {
  await updateDoc(doc(db, COL, id), mapUpdateInputToDoc(patch));
}
