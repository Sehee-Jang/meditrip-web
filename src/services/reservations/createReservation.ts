// 1) src/services/reservations/createReservation.ts
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface NewReservation {
  patientName: string;
  nationality: string;
  hospitalId: string;
  packageId: string;
  hospitalName: string;
  packageName: string;
  date: string;
  time: string;
  notes?: string;
}

/**
 * Firestore에 새로운 예약 문서를 생성
 */
export async function createReservation(data: NewReservation): Promise<string> {
  const docRef = await addDoc(collection(db, "reservations"), {
    ...data,
    status: "pending",
    reservedAt: serverTimestamp(),
  });
  return docRef.id;
}
