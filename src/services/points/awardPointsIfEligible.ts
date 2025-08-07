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
import type { Event } from "@/types/event";

export const awardPointsIfEligible = async ({
  userId,
  triggerType,
}: {
  userId?: string;
  triggerType: string;
}) => {
  if (!userId) return;

  // 1. 해당 트리거의 활성화된 이벤트 목록 조회
  const q = query(
    collection(db, "pointEvents"),
    where("triggerType", "==", triggerType),
    where("active", "==", true)
  );
  const snapshot = await getDocs(q);
  const now = new Date();

  for (const eventDoc of snapshot.docs) {
    const event = eventDoc.data() as Event;
    const eventId = eventDoc.id;

    const logRef = doc(db, "users", userId, "pointLogs", eventId);
    const logSnap = await getDoc(logRef);

    const prevDate = logSnap.exists()
      ? logSnap.data().createdAt?.toDate?.()
      : null;

    // 조건 분기 처리
    const isFirstOnly = event.condition === "firstPostOnly" && logSnap.exists();
    const isOncePerDay =
      event.condition === "oncePerDay" &&
      prevDate &&
      prevDate.toDateString() === now.toDateString();

    if (isFirstOnly || isOncePerDay) {
      console.log(
        `⏭ 이벤트 [${event.description}] 조건 불충족으로 지급 건너뜀`
      );
      continue;
    }

    // 포인트 로그 작성
    await setDoc(logRef, {
      eventId,
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
    console.log(
      `✅ 포인트 ${event.points}P 지급 완료 → [${event.description}]`
    );
  }
};
