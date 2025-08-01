
// import mockHospitals from "@/data/mockHospitals";
// import type { Hospital } from "@/types/Hospital";
// import type { HospitalCategoryKey } from "@/components/common/CategoryFilter";

// interface FetchOpts {
//   query: string;
//   category: HospitalCategoryKey | null;
// }

// export async function fetchHospitals(
//   { query, category }: FetchOpts = { query: "", category: null }
// ): Promise<Hospital[]> {
//   let list = mockHospitals;

//   if (query.trim()) {
//     const q = query.toLowerCase();
//     list = list.filter((h) => h.name.toLowerCase().includes(q));
//   }
//   if (category && category !== "all") {
//     list = list.filter((h) => h.category === category);
//   }

//   return Promise.resolve(list);
// }


// // src/services/hospitals/fetchHospitals.ts
// import { db } from "@/lib/firebase";
// import { collection, getDocs } from "firebase/firestore";

// export interface LocalizedString { ko: string; ja: string }

// export interface Package {
//   id: string;
//   title: LocalizedString;
//   subtitle: LocalizedString;
//   price: LocalizedString;
//   duration: LocalizedString;
//   process: Record<`step${1|2|3|4|5|6}`, LocalizedString>;
//   details: Record<
//     `step${1|2|3|4|5|6}`,
//     { title: LocalizedString; description: LocalizedString; image: string }
//   >;
//   cautions: LocalizedString;
//   photos: string[];
// }

// export interface Hospital {
//   id: string;
//   name: LocalizedString;
//   address: LocalizedString;
//   photos: string[];
//   packages: Package[];
// }

// export async function fetchHospitals(): Promise<Hospital[]> {
//   const snap = await getDocs(collection(db, "hospitals"));
//   return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Hospital, "id">) }));
// }

// src/services/hospitals/fetchHospitals.ts
import type { Hospital } from "@/types/Hospital";
import mockHospitals from "@/data/mockHospitals";

/**
 * 패칭 로직을 모의 데이터 기반으로 변경
 * 실제 배포 시에는 Firestore 등 외부 API 호출로 대체하세요.
 */
export async function fetchHospitals(): Promise<Hospital[]> {
  // mockHospitals를 즉시 반환
  return mockHospitals;
}
