// src/services/community-admin/migrations/stripInlineAnswers.ts
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteField,
  orderBy,
  query,
  type QueryDocumentSnapshot,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type QuestionLite = {
  answers?: unknown; // 제거 대상
  answersCount?: number; // 존재 시 그대로 둠(옵션 보정)
  lastAnsweredAt?: Timestamp; // 옵션 보정
};

export async function stripInlineAnswers(options?: {
  /** 서브컬렉션 기준으로 answersCount/lastAnsweredAt도 보정할지 여부(기본 false) */
  fixAggregates?: boolean;
}): Promise<{ cleaned: number; fixed: number }> {
  const qs = await getDocs(collection(db, "questions"));
  let cleaned = 0;
  let fixed = 0;

  for (const d of qs.docs as QueryDocumentSnapshot<DocumentData>[]) {
    const data = d.data() as QuestionLite;

    // 1) answers 배열 필드가 있으면 제거
    if (Array.isArray(data.answers)) {
      await updateDoc(doc(db, "questions", d.id), { answers: deleteField() });
      cleaned += 1;
    }

    // 2) (옵션) 서브컬렉션으로 집계 보정
    if (options?.fixAggregates) {
      const ansSnap = await getDocs(
        query(
          collection(db, "questions", d.id, "answers"),
          orderBy("createdAt", "desc")
        )
      );
      const newCount = ansSnap.size;
      const newest = ansSnap.docs[0]?.get("createdAt") as Timestamp | undefined;

      // 기존 값과 다르면 업데이트
      const patch: Partial<QuestionLite> = {};
      if (data.answersCount !== newCount) patch.answersCount = newCount;
      if (newest && String(data.lastAnsweredAt) !== String(newest)) {
        patch.lastAnsweredAt = newest;
      }
      if (Object.keys(patch).length > 0) {
        await updateDoc(doc(db, "questions", d.id), patch);
        fixed += 1;
      }
    }
  }

  return { cleaned, fixed };
}
