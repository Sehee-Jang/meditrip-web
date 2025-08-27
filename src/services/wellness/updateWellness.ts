import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UpdateWellnessInput } from "@/types/wellness";
import { mapUpdateInputToDoc } from "./mapWellness";

const COL = "wellness";

export async function updateWellness(
  id: string,
  patch: UpdateWellnessInput
): Promise<void> {
  await updateDoc(doc(db, COL, id), mapUpdateInputToDoc(patch));
}
