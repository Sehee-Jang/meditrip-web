import {
  doc,
  getDoc,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Article } from "@/types/articles";
import { mapSnapToWellness } from "./mapWellness";

const COL = "wellness";

export async function getWellnessById(id: string): Promise<Article | null> {
  const ref = doc(db, COL, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return mapSnapToWellness(snap as QueryDocumentSnapshot<DocumentData>);
}
