import "server-only";
import { db } from "@/lib/firebase";
import { doc, getDoc, type FirestoreDataConverter } from "firebase/firestore";
import type { Clinic } from "@/types/clinic";

const clinicConverter: FirestoreDataConverter<Clinic> = {
  toFirestore: (c: Clinic) => c,
  fromFirestore: (snap) =>
    ({ id: snap.id, ...(snap.data() as Omit<Clinic, "id">) } as Clinic),
};

export async function getClinicById(id: string): Promise<Clinic | null> {
  const ref = doc(db, "clinics", id).withConverter(clinicConverter);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}
