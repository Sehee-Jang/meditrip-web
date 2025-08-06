import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Clinic } from "@/types/clinic";

export async function fetchHospitalById(id: string): Promise<Clinic | null> {
  const ref = doc(db, "clinics", id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return snapshot.data() as Clinic;
}
