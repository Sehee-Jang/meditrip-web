import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export type UserRole = "user" | "admin" | "super_admin";

interface UserDoc {
  role?: UserRole;
}

export async function getUserRole(uid: string): Promise<UserRole | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data() as UserDoc;
  return data.role ?? null;
}
