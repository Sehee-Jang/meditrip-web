import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClinicDoc } from "@/types/clinic";

export const CLINICS_COLLECTION = "clinics" as const;

// 컬렉션 참조
export function articlesColRef(): CollectionReference<ClinicDoc> {
  return collection(db, CLINICS_COLLECTION) as CollectionReference<ClinicDoc>;
}

// 특정 문서 참조
export function articleDocRef(id: string): DocumentReference<ClinicDoc> {
  return doc(db, CLINICS_COLLECTION, id) as DocumentReference<ClinicDoc>;
}
