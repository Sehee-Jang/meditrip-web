import { getDoc, getDocs, orderBy, query } from "firebase/firestore";
import type {
  ClinicDetail,
  ClinicDoc,
  ClinicWithId,
  PackageDoc,
  PackageWithId,
} from "@/types/clinic";
import { clinicDocRef, packagesColRef } from "./collection";

/** 병원 단일 문서만 조회 */
export async function getClinicBaseById(
  id: string
): Promise<ClinicWithId | null> {
  const clinicRef = clinicDocRef(id);
  const clinicSnap = await getDoc(clinicRef);

  if (!clinicSnap.exists()) return null;

  return {
    id: clinicSnap.id,
    ...(clinicSnap.data() as ClinicDoc),
  };
}
/** 병원 패키지 서브컬렉션 조회 */
export async function getClinicPackages(
  clinicId: string
): Promise<PackageWithId[]> {
  const pkgColRef = packagesColRef(clinicId);

  try {
    const pkgQ = query(pkgColRef, orderBy("createdAt", "desc"));
    const pkgSnap = await getDocs(pkgQ);
    return pkgSnap.docs.map((d) => ({
      id: d.id,
      clinicId,
      ...(d.data() as PackageDoc),
    }));
  } catch {

    const pkgSnap = await getDocs(pkgColRef);
    return pkgSnap.docs.map((d) => ({
      id: d.id,
      clinicId,
      ...(d.data() as PackageDoc),
    }));
  }
}

/** 병원 상세 조회(기존 시그니처 유지) */
export async function getClinicById(id: string): Promise<ClinicDetail | null> {
  const clinic = await getClinicBaseById(id);
  if (!clinic) return null;

  const packagesList = await getClinicPackages(clinic.id);
  return { ...clinic, packagesList };
}
