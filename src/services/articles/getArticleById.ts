import {
  getDoc,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import type { Article } from "@/types/articles";
import { mapSnapToArticle } from "./mapArticles";
import { articleDocRef } from "./collection";

export async function getArticleById(id: string): Promise<Article | null> {
  const snap = await getDoc(articleDocRef(id));
  if (!snap.exists()) return null;
  return mapSnapToArticle(snap as QueryDocumentSnapshot<DocumentData>);
}
