import {
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const deductPoints = async ({
  userId,
  amount,
  reason,
}: {
  userId: string;
  amount: number; // 반드시 양수로 받음
  reason: string;
}) => {
  if (amount <= 0) return;

  // 포인트 차감
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    points: increment(-amount),
  });

  // 로그 저장 (차감은 addDoc으로 고유 id 생성)
  await addDoc(collection(db, `users/${userId}/pointLogs`), {
    points: -amount,
    description: reason,
    createdAt: serverTimestamp(),
    source: "admin",
  });
};
