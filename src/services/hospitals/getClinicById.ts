// src/services/hospitals/getClinicById.ts
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import type {
  ClinicDetail,
  ClinicDoc,
  ClinicWithId,
  PackageDoc,
  PackageWithId,
} from "@/types/clinic";

/**
 * 병원 상세 조회 (서브컬렉션 우선 + 레거시 packages 맵 fallback)
 * - 서브컬렉션 /clinics/{id}/packages 이 있으면 그걸 사용
 * - 없으면 문서의 legacy packages 맵을 배열로 변환해 packagesList 로 제공
 * - 반환: ClinicDetail
 */
export async function getClinicById(id: string): Promise<ClinicDetail | null> {
  const clinicRef = doc(db, "clinics", id);
  const clinicSnap = await getDoc(clinicRef);

  if (!clinicSnap.exists()) return null;

  // Firestore 문서를 저장용 타입으로 캐스팅(unknown 거쳐서 any 미사용)
  const clinicData = clinicSnap.data() as unknown as ClinicDoc;

  // 기본 병원 정보 (id 포함)
  const base: ClinicWithId = {
    id: clinicSnap.id,
    ...clinicData,
  };

  // 1) 서브컬렉션 패키지 우선
  const pkgColRef = collection(clinicRef, "packages");
  const pkgSnap = await getDocs(pkgColRef);

  let packagesList: PackageWithId[] = [];

  if (pkgSnap.size > 0) {
    packagesList = pkgSnap.docs.map((d) => {
      const data = d.data() as unknown as PackageDoc;
      const item: PackageWithId = {
        id: d.id,
        clinicId: base.id,
        ...data,
      };
      return item;
    });
  } else {
    // 2) 레거시 packages 맵 fallback
    // createdAt/updatedAt 이 없는 레거시는 병원 문서의 타임스탬프 또는 epoch 로 대체
    const defaultTs =
      clinicData.updatedAt ??
      clinicData.createdAt ??
      Timestamp.fromDate(new Date(0));

    const legacyMap = clinicData.packages;
    if (legacyMap && typeof legacyMap === "object") {
      packagesList = Object.entries(legacyMap).map(([pkgId, val]) => {
        const legacy = val as unknown as Omit<
          PackageDoc,
          "createdAt" | "updatedAt"
        > & {
          createdAt?: Timestamp;
          updatedAt?: Timestamp;
        };
        const item: PackageWithId = {
          id: pkgId,
          clinicId: base.id,
          title: legacy.title,
          subtitle: legacy.subtitle,
          price: legacy.price,
          duration: legacy.duration,
          packageImages: Array.isArray(legacy.packageImages)
            ? legacy.packageImages
            : [],
          treatmentDetails: Array.isArray(legacy.treatmentDetails)
            ? legacy.treatmentDetails
            : undefined,
          precautions: legacy.precautions,
          createdAt: legacy.createdAt ?? defaultTs,
          updatedAt: legacy.updatedAt ?? defaultTs,
        };
        return item;
      });
    }
  }

  // 상세 타입으로 반환(새 구조는 packagesList 사용)
  const detail: ClinicDetail = {
    ...base,
    packagesList,
  };

  return detail;
}
