import {
  getDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  increment,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * 커뮤니티 글 작성 시 포인트 지급
 */
export async function awardCommunityPostPoints(userId: string) {
  const eventRef = doc(db, "pointEvents", "community_post_event");
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) return;

  const event = eventSnap.data();
  if (!event.active) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const logsRef = collection(db, `users/${userId}/pointLogs`);
  let alreadyRewarded = false;

  if (event.condition === "firstPostOnly") {
    const q = query(logsRef, where("eventId", "==", "community_post_event"));
    const snapshot = await getDocs(q);
    alreadyRewarded = !snapshot.empty;
  } else if (event.condition === "oncePerDay") {
    const q = query(
      logsRef,
      where("eventId", "==", "community_post_event"),
      where("createdAt", ">=", today)
    );
    const snapshot = await getDocs(q);
    alreadyRewarded = !snapshot.empty;
  }

  if (alreadyRewarded) return;

  // 1. 포인트 로그 생성
  await addDoc(logsRef, {
    type: "earn",
    reason: "커뮤니티 글 작성",
    amount: event.points,
    eventId: "community_post_event",
    createdAt: serverTimestamp(),
  });

  // 2. 사용자 총 포인트 증가
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    points: increment(event.points),
  });
}
