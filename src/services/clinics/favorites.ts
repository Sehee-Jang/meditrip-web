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
  if (!uid) throw new Error("subscribeFavoriteHospitalIds: uid가 비어 있음");

  const colRef = collection(db, "users", uid, "favorites");

  // 프리플라이트: 권한 거절이면 여기서 바로 오류 원인이 보입니다.
  // 성공하면 실제 구독(onSnapshot) 시작
  void getDocs(colRef)
    .then(() => {
      // 프리플라이트 성공 → 구독 시작
      const unsub = onSnapshot(
        colRef,
        (snap: QuerySnapshot<DocumentData>) => {
          const ids = snap.docs.map((d) => d.id);
          onChange(ids);
        },
        (err) => {
          console.error("[favorites] onSnapshot error:", err);
        }
      );

      // onSnapshot의 Unsubscribe를 반환하기 위해 함수 클로저에서 교체
      (
        subscribeFavoriteHospitalIds as unknown as { lastUnsub?: Unsubscribe }
      ).lastUnsub = unsub;
    })
    .catch((e) => {
      console.error("[favorites] preflight getDocs error:", e);
    });

  // 초기 반환은 no-op 언섭(프리플라이트 실패 시에도 런타임 오류 방지)
  return () => {
    const last = (
      subscribeFavoriteHospitalIds as unknown as { lastUnsub?: Unsubscribe }
    ).lastUnsub;
    if (last) last();
  };
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
  clinicId: string
): Promise<boolean> {
  const ref = doc(db, "users", uid, "favorites", clinicId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, { createdAt: serverTimestamp() }, { merge: false });
  return true;
}
