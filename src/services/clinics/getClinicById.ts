import { getDoc, getDocs, orderBy, query } from "firebase/firestore";
import type { QueryDocumentSnapshot } from "firebase/firestore";
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

  const data = clinicSnap.data() as ClinicDoc;
  if (data.isDeleted) {
    return null;
  }

  return {
    id: clinicSnap.id,
    ...data,
  };
}
/** 병원 패키지 서브컬렉션 조회 */
export async function getClinicPackages(
  clinicId: string
): Promise<PackageWithId[]> {
  const pkgColRef = packagesColRef(clinicId);

  const mapDoc = (d: QueryDocumentSnapshot<PackageDoc>) => {
    const data = d.data() as PackageDoc & Record<string, unknown>;
    const duration = normalizeDuration(data);

    return {
      id: d.id,
      clinicId,
      ...data,
      duration,
    } satisfies PackageWithId;
  };

  const sortPackages = (packages: PackageWithId[]) => {
    const copied = [...packages];
    copied.sort(comparePackagesByDisplayOrder);
    return copied;
  };

  try {
    const pkgQ = query(
      pkgColRef,
      orderBy("displayOrder", "asc"),
      orderBy("createdAt", "desc")
    );
    const pkgSnap = await getDocs(pkgQ);
    return sortPackages(pkgSnap.docs.map(mapDoc));
  } catch {
    const pkgSnap = await getDocs(pkgColRef);
    return sortPackages(pkgSnap.docs.map(mapDoc));
  }
}

function normalizeDuration(data: PackageDoc & Record<string, unknown>): number {
  if (typeof data.duration === "number") return data.duration;
  if (typeof (data.duration as { ko?: number })?.ko === "number") {
    return ((data.duration as { ko?: number }).ko as number) ?? 0;
  }
  if (typeof (data.duration as { ja?: number })?.ja === "number") {
    return ((data.duration as { ja?: number }).ja as number) ?? 0;
  }
  return 0;
}

function comparePackagesByDisplayOrder(a: PackageWithId, b: PackageWithId) {
  const ax =
    typeof a.displayOrder === "number"
      ? a.displayOrder
      : Number.MAX_SAFE_INTEGER;
  const bx =
    typeof b.displayOrder === "number"
      ? b.displayOrder
      : Number.MAX_SAFE_INTEGER;

  if (ax !== bx) return ax - bx;

  const toMs = (v: unknown): number => {
    if (
      v &&
      typeof v === "object" &&
      "seconds" in (v as Record<string, unknown>)
    ) {
      const ts = v as { seconds: number };
      return ts.seconds * 1000;
    }
    if (v instanceof Date) return v.getTime();
    return 0;
  };

  return toMs(b.createdAt) - toMs(a.createdAt);
}

/** 병원 상세 조회(기존 시그니처 유지) */
export async function getClinicById(id: string): Promise<ClinicDetail | null> {
  const clinic = await getClinicBaseById(id);
  if (!clinic) return null;

  const packagesList = await getClinicPackages(clinic.id);
  return { ...clinic, packagesList };
}
