import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Event } from "@/types/event";

export const addEvent = async (event: Omit<Event, "id">) => {
  await addDoc(collection(db, "pointEvents"), {
    ...event,
    createdAt: serverTimestamp(),
  });
};
