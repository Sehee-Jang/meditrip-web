import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

export interface Reservation {
  id: string;
  patientName: string;
  nationality: string;
  clinicName: string;
  packageName: string;
  status: string;
  reservedAt: Timestamp;
}

export async function getReservations(): Promise<Reservation[]> {
  const q = query(
    collection(db, "reservations"),
    orderBy("reservedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const data = doc.data() as Omit<Reservation, "id">;

    return {
      id: doc.id,
      patientName: data.patientName,
      nationality: data.nationality,
      clinicName: data.clinicName,
      packageName: data.packageName,
      status: data.status,
      reservedAt: data.reservedAt,
    };
  });
}
