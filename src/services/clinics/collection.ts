import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClinicDoc, PackageDoc } from "@/types/clinic";

export const CLINICS_COLLECTION = "clinics" as const;

// 컬렉션 참조
export function clinicsColRef(): CollectionReference<ClinicDoc> {
  return collection(db, CLINICS_COLLECTION) as CollectionReference<ClinicDoc>;
}

// clinics/{id} 문서
export function clinicDocRef(id: string): DocumentReference<ClinicDoc> {
  return doc(db, CLINICS_COLLECTION, id) as DocumentReference<ClinicDoc>;
}

// linics/{id}/packages 컬렉션
export function packagesColRef(
  clinicId: string
): CollectionReference<PackageDoc> {
  return collection(
    clinicDocRef(clinicId),
    "packages"
  ) as CollectionReference<PackageDoc>;
}
