import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const deleteEvent = async (eventId: string) => {
  const ref = doc(db, "pointEvents", eventId);
  await deleteDoc(ref);
};
