import { getDoc, getDocs, orderBy, query } from "firebase/firestore";
import type {
  ClinicDetail,
  ClinicDoc,
  ClinicWithId,
  PackageDoc,
  PackageWithId,
} from "@/types/clinic";
import { clinicDocRef, packagesColRef } from "./collection";

/**
 * 병원 상세 조회 (서브컬렉션 우선 + 레거시 packages 맵 fallback)
 * - clinics/{id} 문서를 읽고
 * - clinics/{id}/packages 서브컬렉션을 배열로 조회해 packagesList로 합침
 */
export async function getClinicById(id: string): Promise<ClinicDetail | null> {
  const clinicRef = clinicDocRef(id);
  const clinicSnap = await getDoc(clinicRef);

  if (!clinicSnap.exists()) return null;

  // Firestore 문서를 저장용 타입으로 캐스팅(unknown 거쳐서 any 미사용)
  // 문서 데이터에 id 병합
  const clinic: ClinicWithId = {
    id: clinicSnap.id,
    ...(clinicSnap.data() as ClinicDoc),
  };

  // 패키지 서브컬렉션 조회 (createdAt desc 우선, 실패 시 무정렬 폴백)
  const pkgColRef = packagesColRef(clinic.id);

  let packagesList: PackageWithId[] = [];
  try {
    const pkgQ = query(pkgColRef, orderBy("createdAt", "desc"));
    const pkgSnap = await getDocs(pkgQ);
    packagesList = pkgSnap.docs.map((d) => ({
      id: d.id,
      clinicId: clinic.id,
      ...(d.data() as PackageDoc),
    }));
  } catch {
    // createdAt 인덱스/필드 미존재 시 무정렬 조회
    const pkgSnap = await getDocs(pkgColRef);
    packagesList = pkgSnap.docs.map((d) => ({
      id: d.id,
      clinicId: clinic.id,
      ...(d.data() as PackageDoc),
    }));
  }

  return { ...clinic, packagesList };
}
