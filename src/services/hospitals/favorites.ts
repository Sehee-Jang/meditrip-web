import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function subscribeFavoriteHospitalIds(
  uid: string,
  onChange: (ids: string[]) => void
): Unsubscribe {
  const colRef = collection(db, "users", uid, "favorites");
  return onSnapshot(colRef, (qs: QuerySnapshot<DocumentData>) => {
    const ids = qs.docs.map((d) => d.id);
    onChange(ids);
  });
}

export async function getUserFavoriteHospitalIds(
  uid: string
): Promise<string[]> {
  const colRef = collection(db, "users", uid, "favorites");
  const qs = await getDocs(colRef);
  return qs.docs.map((d) => d.id);
}

export async function toggleFavoriteHospital(
  uid: string,
  hospitalId: string
): Promise<boolean> {
  const ref = doc(db, "users", uid, "favorites", hospitalId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, { createdAt: serverTimestamp() });
  return true;
}
