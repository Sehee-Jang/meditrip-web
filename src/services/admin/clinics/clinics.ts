import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as limitFn,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  Timestamp,
  updateDoc,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  ClinicDoc,
  ClinicWithId,
  PackageDoc,
  PackageWithId,
  ClinicStatus,
} from "@/types/clinic";
import { CATEGORY_KEYS, type CategoryKey } from "@/constants/categories";

// undefined/빈 문자열 제거 유틸
function compactSocials(
  s: ClinicDoc["socials"] | undefined
): ClinicDoc["socials"] | undefined {
  if (!s) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(s)) {
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (trimmed) out[k] = trimmed;
    }
  }
  return Object.keys(out).length ? (out as ClinicDoc["socials"]) : undefined;
}

// 1단계(shallow)에서만 undefined 제거
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
  return Object.fromEntries(entries) as T;
}

/* ===============================
 * Converters
 * =============================== */
const clinicsCol = collection(db, "clinics");
// 허용 키만 통과
const asCategoryKeys = (val: unknown): CategoryKey[] => {
  if (!Array.isArray(val)) return [];
  return (val as unknown[]).filter((k): k is CategoryKey =>
    typeof k === "string" && CATEGORY_KEYS.includes(k as CategoryKey)
  );
};

const clinicConverter: FirestoreDataConverter<ClinicDoc> = {
  toFirestore: (data): DocumentData => data,
  fromFirestore: (snap): ClinicDoc => {
    const d = snap.data() as DocumentData;

    // socials 정리(문자열만 유지)
    const socials = (() => {
      if (!d.socials || typeof d.socials !== "object") return undefined;
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(
        d.socials as Record<string, unknown>
      )) {
        if (typeof v === "string" && v.trim()) out[k] = v;
      }
      return Object.keys(out).length ? out : undefined;
    })();

    return {
      name: d.name,
      address: d.address,
      geo: d.geo,
      intro: d.intro,
      categoryKeys: asCategoryKeys(
        (d as { categoryKeys?: unknown }).categoryKeys
      ),
      vision: d.vision,
      mission: d.mission,
      description: d.description,
      events: d.events ?? { ko: [], ja: [], zh: [], en: [] },
      reservationNotices: d.reservationNotices ?? {
        ko: [],
        ja: [],
        zh: [],
        en: [],
      },
      // 연락처 & 웹·SNS
      phone: typeof d.phone === "string" ? d.phone : undefined,
      website: typeof d.website === "string" ? d.website : undefined,
      socials,

      // 영업시간/휴무/안내문
      weeklyHours: d.weeklyHours, // { mon: [{open,close}], ... } 형태 그대로 전달
      weeklyClosedDays: Array.isArray(d.weeklyClosedDays)
        ? d.weeklyClosedDays
        : [],
      hoursNote: d.hoursNote,

      // 편의시설/태그/이미지
      amenities: Array.isArray(d.amenities) ? d.amenities : [],
      tagSlugs: Array.isArray(d.tagSlugs) ? d.tagSlugs : [],
      images: Array.isArray(d.images) ? (d.images as string[]) : [],

      // 의료진 소개
      doctors: Array.isArray(d.doctors) ? d.doctors : [],

      // 기타
      isFavorite: Boolean(d.isFavorite),
      rating: typeof d.rating === "number" ? d.rating : 0,
      reviewCount: typeof d.reviewCount === "number" ? d.reviewCount : 0,
      status: (d.status as "visible" | "hidden") ?? "visible",
      createdAt: d.createdAt as Timestamp,
      updatedAt: d.updatedAt as Timestamp,
      packages_migrated: d.packages_migrated,
      packageCount: d.packageCount,
    };
  },
};

const packageConverter: FirestoreDataConverter<PackageDoc> = {
  toFirestore: (data): DocumentData => data,
  fromFirestore: (snap): PackageDoc => {
    const d = snap.data() as DocumentData;
    return {
      title: d.title,
      subtitle: d.subtitle,
      price: d.price,
      duration: d.duration,
      packageImages: Array.isArray(d.packageImages)
        ? (d.packageImages as string[])
        : [],
      treatmentDetails: Array.isArray(d.treatmentDetails)
        ? (d.treatmentDetails as PackageDoc["treatmentDetails"])
        : undefined,
      precautions: d.precautions,
      createdAt: d.createdAt as Timestamp,
      updatedAt: d.updatedAt as Timestamp,
    };
  },
};

/* ===============================
 * Clinics CRUD
 * =============================== */
export interface ListResult<T> {
  items: T[];
  cursor: QueryDocumentSnapshot<DocumentData> | null;
}

export async function listClinics(
  pageSize = 20,
  cursor?: QueryDocumentSnapshot<DocumentData>,
  sortKey: string = "createdAt"
): Promise<ListResult<ClinicWithId>> {
  const q = cursor
    ? query(
        clinicsCol.withConverter(clinicConverter),
        orderBy(sortKey as never, "desc" as never),
        startAfter(cursor),
        limitFn(pageSize)
      )
    : query(
        clinicsCol.withConverter(clinicConverter),
        orderBy(sortKey as never, "desc" as never),
        limitFn(pageSize)
      );

  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const last = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  return { items, cursor: last };
}

export async function getClinicByIdAdmin(
  id: string
): Promise<ClinicWithId | null> {
  const ref = doc(db, "clinics", id).withConverter(clinicConverter);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// export async function createClinic(
//   values: Omit<ClinicDoc, "createdAt" | "updatedAt">
// ): Promise<string> {
//   const now = serverTimestamp();
//   const data: ClinicDoc = {
//     ...values,
//     createdAt: now as unknown as Timestamp,
//     updatedAt: now as unknown as Timestamp,
//   };
//   const ref = await addDoc(clinicsCol.withConverter(clinicConverter), data);
//   return ref.id;
// }
export async function createClinic(
  values: Omit<ClinicDoc, "createdAt" | "updatedAt">
): Promise<string> {
  const now = serverTimestamp();

  // socials 정리
  const socialsClean = compactSocials(values.socials);

  // 최종 payload (최상위 undefined 제거)
  const base = stripUndefined({
    ...values,
    socials: socialsClean,
  });

  const data: ClinicDoc = {
    ...(base as Omit<ClinicDoc, "createdAt" | "updatedAt">),
    createdAt: now as unknown as Timestamp,
    updatedAt: now as unknown as Timestamp,
  };

  const ref = await addDoc(clinicsCol.withConverter(clinicConverter), data);
  return ref.id;
}

// export async function updateClinic(
//   id: string,
//   values: Partial<Omit<ClinicDoc, "createdAt" | "updatedAt">>
// ): Promise<void> {
//   const ref = doc(db, "clinics", id).withConverter(clinicConverter);
//   await updateDoc(ref, { ...values, updatedAt: serverTimestamp() });
// }
export async function updateClinic(
  id: string,
  values: Partial<Omit<ClinicDoc, "createdAt" | "updatedAt">>
): Promise<void> {
  const ref = doc(db, "clinics", id).withConverter(clinicConverter);

  // socials 정리
  const socialsClean = compactSocials(values.socials);

  // 최상위 undefined 제거 + updatedAt 부여
  const payload = stripUndefined({
    ...values,
    socials: socialsClean,
    updatedAt: serverTimestamp(),
  });

  await updateDoc(ref, payload);
}

export async function deleteClinic(id: string): Promise<void> {
  await deleteDoc(doc(db, "clinics", id));
}

export async function updateClinicStatus(
  clinicId: string,
  status: ClinicStatus
): Promise<void> {
  const ref = doc(db, "clinics", clinicId);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

/* ===============================
 * Packages (subcollection)
 * =============================== */
export function packagesCol(clinicId: string) {
  return collection(db, "clinics", clinicId, "packages");
}

export async function listPackagesAdmin(
  clinicId: string
): Promise<PackageWithId[]> {
  const q = query(
    packagesCol(clinicId).withConverter(packageConverter),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, clinicId, ...d.data() }));
}

export async function createPackage(
  clinicId: string,
  values: Omit<PackageDoc, "createdAt" | "updatedAt">
): Promise<string> {
  const now = serverTimestamp();
  const data: PackageDoc = {
    ...values,
    createdAt: now as unknown as Timestamp,
    updatedAt: now as unknown as Timestamp,
  };
  const ref = await addDoc(
    packagesCol(clinicId).withConverter(packageConverter),
    data
  );
  await syncPackageCount(clinicId);
  return ref.id;
}

export async function updatePackage(
  clinicId: string,
  packageId: string,
  values: Partial<Omit<PackageDoc, "createdAt" | "updatedAt">>
): Promise<void> {
  const ref = doc(db, "clinics", clinicId, "packages", packageId).withConverter(
    packageConverter
  );
  await updateDoc(ref, { ...values, updatedAt: serverTimestamp() });
  await syncPackageCount(clinicId);
}

export async function deletePackage(
  clinicId: string,
  packageId: string
): Promise<void> {
  await deleteDoc(doc(db, "clinics", clinicId, "packages", packageId));
  await syncPackageCount(clinicId);
}

export async function syncPackageCount(clinicId: string): Promise<void> {
  const q = query(packagesCol(clinicId));
  const snap = await getDocs(q);
  const ref = doc(db, "clinics", clinicId);
  await updateDoc(ref, {
    packageCount: snap.size,
    updatedAt: serverTimestamp(),
    packages_migrated: true,
  });
}
