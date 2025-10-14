import { getDocs, orderBy, query, where } from "firebase/firestore";
import type { ClinicListItem } from "@/types/clinic";
import { clinicsColRef } from "./collection";

export async function fetchClinics(): Promise<ClinicListItem[]> {
  // 노출용: visible만 + displayOrder 오름차순(작을수록 상단), 동점은 createdAt 내림차순
  const q = query(
    clinicsColRef(),
    where("status", "==", "visible"),
    orderBy("displayOrder", "asc"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ClinicListItem[];

  const visibleItems = items.filter((item) => item.isDeleted !== true);

  // 안전 보정: displayOrder가 없는 문서는 끝으로 보냄(+ createdAt DESC로 동률 정렬)
  visibleItems.sort((a, b) => {
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
      // Firestore Timestamp 또는 Date 대응
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
  });

  return visibleItems;
}
