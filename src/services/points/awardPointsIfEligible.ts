import {
  getDocs,
  doc,
  collection,
  query,
  where,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Event } from "@/types/event";

export const awardPointsIfEligible = async ({
  userId,
  triggerType,
}: {
  userId?: string;
  triggerType: string;
}) => {
  if (!userId) return;

  // 1. 해당 트리거의 활성화된 이벤트 목록 조회
  const eventsQuery = query(
    collection(db, "pointEvents"),
    where("triggerType", "==", triggerType),
    where("active", "==", true)
  );
  const snapshot = await getDocs(eventsQuery);

  const now = new Date();

  for (const docSnap of snapshot.docs) {
    const event = docSnap.data() as Event;

    const logRef = doc(db, "users", userId, "pointLogs", docSnap.id);
    const logSnap = await getDoc(logRef);

    const alreadyGiven = logSnap.exists();
    const logData = logSnap.data();

    const createdAt = logData?.createdAt?.toDate?.() as Date | undefined;

    // 조건 검사
    const shouldSkip =
      (event.condition === "firstPostOnly" && alreadyGiven) ||
      (event.condition === "oncePerDay" &&
        createdAt?.toDateString() === now.toDateString());

    if (shouldSkip) continue;

    // 포인트 로그 작성
    await setDoc(logRef, {
      eventId: docSnap.id,
      triggerType,
      description: event.description,
      points: event.points,
      createdAt: serverTimestamp(),
    });

    // 유저 포인트 증가
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      points: increment(event.points),
    });
  }
};
