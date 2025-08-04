import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * 사용자의 찜한 병원 목록 가져오기
 */
export async function getUserFavoriteHospitalIds(
  userId: string
): Promise<string[]> {
  const ref = doc(db, "favorites", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  return snap.data().hospitalIds || [];
}

/**
 * 병원 찜/취소 토글
 */
export async function toggleFavoriteHospital(
  userId: string,
  hospitalId: string
): Promise<void> {
  const ref = doc(db, "favorites", userId);
  const snap = await getDoc(ref);
  let hospitalIds: string[] = snap.exists()
    ? snap.data().hospitalIds || []
    : [];

  if (hospitalIds.includes(hospitalId)) {
    hospitalIds = hospitalIds.filter((id) => id !== hospitalId);
  } else {
    hospitalIds.push(hospitalId);
  }

  await setDoc(ref, { hospitalIds }, { merge: true });
}

/**
 * 특정 병원이 찜되어 있는지 여부 확인
 */
export async function isHospitalFavorited(
  userId: string,
  hospitalId: string
): Promise<boolean> {
  const ids = await getUserFavoriteHospitalIds(userId);
  return ids.includes(hospitalId);
}
