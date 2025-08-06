import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const toggleEventActive = async (eventId: string, current: boolean) => {
  const ref = doc(db, "pointEvents", eventId);
  await updateDoc(ref, { active: !current });
};
