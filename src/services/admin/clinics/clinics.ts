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

/* ===============================
 * Converters
 * =============================== */
const clinicsCol = collection(db, "clinics");

const clinicConverter: FirestoreDataConverter<ClinicDoc> = {
  toFirestore: (data): DocumentData => data,
  fromFirestore: (snap): ClinicDoc => {
    const d = snap.data() as DocumentData;
    return {
      name: d.name,
      address: d.address,
      geo: d.geo,
      intro: d.intro,
      category: d.category,
      vision: d.vision,
      mission: d.mission,
      description: d.description,
      events: d.events ?? { ko: [], ja: [] },
      isFavorite: Boolean(d.isFavorite),
      rating: typeof d.rating === "number" ? d.rating : 0,
      reviewCount: typeof d.reviewCount === "number" ? d.reviewCount : 0,
      images: Array.isArray(d.images) ? (d.images as string[]) : [],
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

export async function createClinic(
  values: Omit<ClinicDoc, "createdAt" | "updatedAt">
): Promise<string> {
  const now = serverTimestamp();
  const data: ClinicDoc = {
    ...values,
    createdAt: now as unknown as Timestamp,
    updatedAt: now as unknown as Timestamp,
  };
  const ref = await addDoc(clinicsCol.withConverter(clinicConverter), data);
  return ref.id;
}

export async function updateClinic(
  id: string,
  values: Partial<Omit<ClinicDoc, "createdAt" | "updatedAt">>
): Promise<void> {
  const ref = doc(db, "clinics", id).withConverter(clinicConverter);
  await updateDoc(ref, { ...values, updatedAt: serverTimestamp() });
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
