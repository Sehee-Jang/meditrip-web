import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import type { ClinicListItem } from "@/types/clinic";

export async function fetchClinics(): Promise<ClinicListItem[]> {
  // status가 visible인 병원만 노출
  const q = query(
    collection(db, "clinics"),
    where("status", "==", "visible"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ClinicListItem[];
}
