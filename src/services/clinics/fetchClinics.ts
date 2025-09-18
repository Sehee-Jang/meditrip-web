import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { ClinicListItem } from "@/types/clinic";

export async function fetchClinics(): Promise<ClinicListItem[]> {
  const snapshot = await getDocs(collection(db, "clinics"));
  const clinics = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ClinicListItem[];
  return clinics;
}
