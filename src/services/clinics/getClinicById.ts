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
    return pkgSnap.docs.map((d) => {
      const data = d.data() as PackageDoc & Record<string, unknown>;
      const duration =
        typeof data.duration === "number"
          ? data.duration
          : typeof (data.duration as { ko?: number })?.ko === "number"
          ? ((data.duration as { ko?: number }).ko as number)
          : typeof (data.duration as { ja?: number })?.ja === "number"
          ? ((data.duration as { ja?: number }).ja as number)
          : 0;

      return {
        id: d.id,
        clinicId,
        ...data,
        duration,
      };
    });
  } catch {
    const pkgSnap = await getDocs(pkgColRef);
      return pkgSnap.docs.map((d) => {
      const data = d.data() as PackageDoc & Record<string, unknown>;
      const duration =
        typeof data.duration === "number"
          ? data.duration
          : typeof (data.duration as { ko?: number })?.ko === "number"
            ? ((data.duration as { ko?: number }).ko as number)
            : typeof (data.duration as { ja?: number })?.ja === "number"
              ? ((data.duration as { ja?: number }).ja as number)
              : 0;

      return {
        id: d.id,
        clinicId,
        ...data,
        duration,
      };
    });
  }
}

/** 병원 상세 조회(기존 시그니처 유지) */
export async function getClinicById(id: string): Promise<ClinicDetail | null> {
  const clinic = await getClinicBaseById(id);
  if (!clinic) return null;

  const packagesList = await getClinicPackages(clinic.id);
  return { ...clinic, packagesList };
}
