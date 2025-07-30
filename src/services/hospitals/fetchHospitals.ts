import mockHospitals from "@/data/mockHospitals";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Hospital } from "@/types/Hospital";

/**
 * 개발 중에는 mock 데이터를,
 * 배포 시에는 Firestore 데이터를 사용하도록 분기 처리
 */
const USE_MOCK = process.env.NODE_ENV === "development";

export async function fetchHospitals(): Promise<Hospital[]> {
  if (USE_MOCK) {
    // 1) 목데이터 바로 리턴
    return Promise.resolve(mockHospitals);
  }

  // 2) (실제 배포 시) Firestore 로직
  const colRef = collection(db, "hospitals");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<Hospital, "id">;
    return { id: doc.id, ...data };
  });
}
