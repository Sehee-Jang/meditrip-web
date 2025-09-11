import {
  doc,
  getDoc,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Article } from "@/types/articles";
import { mapSnapToArticle } from "./mapArticles";

const COL = "wellness";

export async function getArticleById(id: string): Promise<Article | null> {
  const ref = doc(db, COL, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return mapSnapToArticle(snap as QueryDocumentSnapshot<DocumentData>);
}
