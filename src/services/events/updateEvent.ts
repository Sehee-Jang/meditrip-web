import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Event } from "@/types/event";

export const updateEvent = async (
  eventId: string,
  updatedFields: Partial<Event>
) => {
  const ref = doc(db, "pointEvents", eventId);
  await updateDoc(ref, updatedFields);
};
