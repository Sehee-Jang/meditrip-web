import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ArticleDoc } from "@/types/articles";

export const ARTICLES_COLLECTION = "articles" as const;

// 컬렉션 참조
export function articlesColRef(): CollectionReference<ArticleDoc> {
  return collection(db, ARTICLES_COLLECTION) as CollectionReference<ArticleDoc>;
}

// 특정 문서 참조
export function articleDocRef(id: string): DocumentReference<ArticleDoc> {
  return doc(db, ARTICLES_COLLECTION, id) as DocumentReference<ArticleDoc>;
}
