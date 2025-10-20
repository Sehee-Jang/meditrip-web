import {
  addDoc,
  collection,
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
  writeBatch,
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
import {
  clinicsColRef,
  clinicDocRef,
  packagesColRef,
} from "@/services/clinics/collection";

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

/** 객체가 "순수 객체(Plain Object)"인지 확인 */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (typeof v !== "object" || v === null) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

/** 중첩된 모든 depth에서 undefined 값을 제거
 *  - 배열: 요소를 재귀 처리하고 undefined 요소는 제거
 *  - 순수 객체: 키를 재귀 처리하고 값이 undefined면 키를 제거
 *  - Firestore 특수 타입(Timestamp/FieldValue/GeoPoint 등)은 그대로 유지
 */
function stripUndefinedDeep<T>(input: T): T {
  if (Array.isArray(input)) {
    const arr = input
      .map((v) => stripUndefinedDeep(v))
      .filter((v) => v !== undefined);
    return arr as unknown as T;
  }
  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      if (v === undefined) continue;
      const cleaned = stripUndefinedDeep(v);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    return out as T;
  }
  return input;
}

/* ===============================
 * Converters
 * =============================== */
const clinicsCol = collection(db, "clinics");

// 허용 키만 통과
const asCategoryKeys = (val: unknown): CategoryKey[] => {
  if (!Array.isArray(val)) return [];
  return (val as unknown[]).filter(
    (k): k is CategoryKey =>
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
      displayOrder:
        typeof d.displayOrder === "number" ? d.displayOrder : undefined,

      categoryKeys: asCategoryKeys(
        (d as { categoryKeys?: unknown }).categoryKeys
      ),

      description: d.description,
      highlights: d.highlights,
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
      isExclusive: Boolean(d.isExclusive),
      isRecommended: d.isRecommended === true,
      rating: typeof d.rating === "number" ? d.rating : 0,
      reviewCount: typeof d.reviewCount === "number" ? d.reviewCount : 0,
      status: (d.status as "visible" | "hidden") ?? "visible",
      isDeleted: d.isDeleted === true,
      deletedAt:
        d.deletedAt instanceof Timestamp
          ? (d.deletedAt as Timestamp)
          : undefined,
      createdAt: d.createdAt as Timestamp,
      updatedAt: d.updatedAt as Timestamp,
    };
  },
};

const packageConverter: FirestoreDataConverter<PackageDoc> = {
  toFirestore: (data): DocumentData => data,
  fromFirestore: (snap): PackageDoc => {
    const d = snap.data() as DocumentData;
    const createdAt = d.createdAt as Timestamp;

    return {
      title: d.title,
      subtitle: d.subtitle,
      price: d.price,
      duration:
        typeof d.duration === "number"
          ? d.duration
          : typeof (d.duration as { ko?: number })?.ko === "number"
          ? ((d.duration as { ko?: number }).ko as number)
          : typeof (d.duration as { ja?: number })?.ja === "number"
          ? ((d.duration as { ja?: number }).ja as number)
          : 0,
      packageImages: Array.isArray(d.packageImages)
        ? (d.packageImages as string[])
        : [],
      treatmentProcess: Array.isArray(d.treatmentProcess)
        ? (d.treatmentProcess as PackageDoc["treatmentProcess"])
        : undefined,
      treatmentDetails: Array.isArray(d.treatmentDetails)
        ? (d.treatmentDetails as PackageDoc["treatmentDetails"])
        : undefined,
      precautions: d.precautions,
      displayOrder:
        typeof d.displayOrder === "number"
          ? (d.displayOrder as number)
          : createdAt instanceof Timestamp
          ? -createdAt.toMillis()
          : undefined,
      createdAt: createdAt,
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
  sortKey: string = "displayOrder",
  direction: "asc" | "desc" = "asc"
): Promise<ListResult<ClinicWithId>> {
  const base = clinicsColRef().withConverter(clinicConverter);

  // 우선 시도: displayOrder asc + createdAt desc (보조 정렬)
  const primaryQuery = (() => {
    if (sortKey === "displayOrder") {
      return cursor
        ? query(
            base,
            orderBy("displayOrder", "asc" as never),
            orderBy("createdAt", "desc" as never),
            startAfter(cursor),
            limitFn(pageSize)
          )
        : query(
            base,
            orderBy("displayOrder", "asc" as never),
            orderBy("createdAt", "desc" as never),
            limitFn(pageSize)
          );
    }
    // 그 외 일반 정렬
    return cursor
      ? query(
          base,
          orderBy(sortKey as never, direction as never),
          startAfter(cursor),
          limitFn(pageSize)
        )
      : query(
          base,
          orderBy(sortKey as never, direction as never),
          limitFn(pageSize)
        );
  })();

  try {
    const snap = await getDocs(primaryQuery);
    // 결과가 비정상적으로 비면 폴백(기존 createdAt desc)
    if (snap.empty && sortKey === "displayOrder") {
      const fallbackQ = cursor
        ? query(
            base,
            orderBy("createdAt", "desc" as never),
            startAfter(cursor),
            limitFn(pageSize)
          )
        : query(base, orderBy("createdAt", "desc" as never), limitFn(pageSize));
      const fbSnap = await getDocs(fallbackQ);
      const fbItems = fbSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const fbLast =
        fbSnap.docs.length > 0 ? fbSnap.docs[fbSnap.docs.length - 1] : null;
      return { items: fbItems, cursor: fbLast };
    }

    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const last = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
    return { items, cursor: last };
  } catch {
    // 쿼리 에러 시(인덱스 미생성 등)도 createdAt desc로 폴백
    const fallbackQ = cursor
      ? query(
          base,
          orderBy("createdAt", "desc" as never),
          startAfter(cursor),
          limitFn(pageSize)
        )
      : query(base, orderBy("createdAt", "desc" as never), limitFn(pageSize));
    const fbSnap = await getDocs(fallbackQ);
    const fbItems = fbSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const fbLast =
      fbSnap.docs.length > 0 ? fbSnap.docs[fbSnap.docs.length - 1] : null;
    return { items: fbItems, cursor: fbLast };
  }
}

export async function getClinicByIdAdmin(
  id: string
): Promise<ClinicWithId | null> {
  const ref = clinicDocRef(id).withConverter(clinicConverter);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createClinic(
  values: Omit<ClinicDoc, "createdAt" | "updatedAt">
): Promise<string> {
  const now = serverTimestamp();

  // socials 정리
  const socialsClean = compactSocials(values.socials);

  // 깊은 단계까지 undefined 제거
  const base = stripUndefinedDeep({
    ...values,
    socials: socialsClean,
  });

  const data: ClinicDoc = {
    ...(base as Omit<ClinicDoc, "createdAt" | "updatedAt">),
    // 전달 안되면 기본값 부여
    displayOrder:
      typeof (base as { displayOrder?: unknown }).displayOrder === "number"
        ? (base as { displayOrder?: number }).displayOrder
        : -Date.now(),
    isDeleted: false,
    deletedAt: null,
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
  const ref = clinicDocRef(id).withConverter(clinicConverter);

  // socials 정리
  const socialsClean = compactSocials(values.socials);

  // 깊은 단계까지 undefined 제거 + updatedAt 부여
  const payload = stripUndefinedDeep({
    ...values,
    socials: socialsClean,
    updatedAt: serverTimestamp(),
  });

  await updateDoc(ref, payload);
}

export async function deleteClinic(id: string): Promise<void> {
  const ref = clinicDocRef(id);
  await updateDoc(ref, {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    status: "hidden",
    updatedAt: serverTimestamp(),
  });
}

export async function restoreClinic(id: string): Promise<void> {
  const ref = clinicDocRef(id);
  await updateDoc(ref, {
    isDeleted: false,
    deletedAt: null,
    status: "hidden",
    updatedAt: serverTimestamp(),
  });
}

export async function updateClinicStatus(
  clinicId: string,
  status: ClinicStatus
): Promise<void> {
  const ref = doc(db, "clinics", clinicId);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

export async function updateClinicRecommendation(
  clinicId: string,
  isRecommended: boolean
): Promise<void> {
  const ref = doc(db, "clinics", clinicId);
  await updateDoc(ref, {
    isRecommended,
    updatedAt: serverTimestamp(),
  });
}

/* ===============================
 * Packages (subcollection)
 * =============================== */
export function packagesCol(clinicId: string) {
  return packagesColRef(clinicId);
}

export async function listPackagesAdmin(
  clinicId: string
): Promise<PackageWithId[]> {
  const base = packagesCol(clinicId).withConverter(packageConverter);
  const ordered = query(
    base,
    orderBy("displayOrder", "asc"),
    orderBy("createdAt", "desc")
  );
  try {
    const snap = await getDocs(ordered);
    return snap.docs.map((d) => ({ id: d.id, clinicId, ...d.data() }));
  } catch {
    const fallbackSnap = await getDocs(
      query(base, orderBy("createdAt", "desc"))
    );
    const items = fallbackSnap.docs.map((d) => ({
      id: d.id,
      clinicId,
      ...d.data(),
    }));
    return items.sort((a, b) => {
      const aOrder =
        typeof a.displayOrder === "number"
          ? a.displayOrder
          : Number.POSITIVE_INFINITY;
      const bOrder =
        typeof b.displayOrder === "number"
          ? b.displayOrder
          : Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      const aCreated =
        a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const bCreated =
        b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return bCreated - aCreated;
    });
  }
}

export async function createPackage(
  clinicId: string,
  values: Omit<PackageDoc, "createdAt" | "updatedAt">
): Promise<string> {
  const now = serverTimestamp();

  // zh/en 숫자 필드가 비어있으면 undefined일 수 있으니, 저장 전 제거
  const cleaned = stripUndefinedDeep(values);
  const base = cleaned as Omit<PackageDoc, "createdAt" | "updatedAt">;

  const data: PackageDoc = {
    ...base,
    displayOrder:
      typeof base.displayOrder === "number" ? base.displayOrder : -Date.now(),
    createdAt: now as unknown as Timestamp,
    updatedAt: now as unknown as Timestamp,
  };

  const ref = await addDoc(
    packagesCol(clinicId).withConverter(packageConverter),
    data
  );
  await updateDoc(doc(db, "clinics", clinicId), {
    updatedAt: serverTimestamp(),
  });
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

  const payload = stripUndefinedDeep({
    ...values,
    updatedAt: serverTimestamp(),
  });

  await updateDoc(ref, payload);
  await updateDoc(doc(db, "clinics", clinicId), {
    updatedAt: serverTimestamp(),
  });
}

export async function deletePackage(
  clinicId: string,
  packageId: string
): Promise<void> {
  const batch = writeBatch(db);
  const packageRef = doc(db, "clinics", clinicId, "packages", packageId);
  const clinicRef = doc(db, "clinics", clinicId);

  batch.delete(packageRef);
  batch.update(clinicRef, {
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

// displayOrder 일괄 업데이트(batch)
export async function updateClinicOrders(
  orderMap: ReadonlyArray<{ id: string; displayOrder: number }>
): Promise<void> {
  const batch = writeBatch(db);
  for (const { id, displayOrder } of orderMap) {
    batch.update(clinicDocRef(id), {
      displayOrder,
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

export async function updatePackageOrders(
  clinicId: string,
  orderMap: ReadonlyArray<{ id: string; displayOrder: number }>
): Promise<void> {
  if (orderMap.length === 0) return;

  const batch = writeBatch(db);
  const clinicRef = clinicDocRef(clinicId);

  for (const { id, displayOrder } of orderMap) {
    const pkgRef = doc(db, "clinics", clinicId, "packages", id);
    batch.update(pkgRef, {
      displayOrder,
      updatedAt: serverTimestamp(),
    });
  }

  batch.update(clinicRef, {
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}
