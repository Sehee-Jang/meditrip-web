import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CreateArticleInput } from "@/types/articles";
import { mapCreateInputToDoc } from "./mapWellness";

const COL = "wellness";

export async function createWellness(input: CreateArticleInput): Promise<string> {
  const ref = await addDoc(collection(db, COL), mapCreateInputToDoc(input));
  return ref.id;
}
