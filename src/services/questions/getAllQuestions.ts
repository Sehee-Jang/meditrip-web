import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import type { Question } from "@/types/question";

const toISO = (ts?: Timestamp) =>
  ts ? ts.toDate().toISOString() : new Date().toISOString();

/** 공개용 전체 목록(숨김 제외). 필요 시 상위에서 slice/limit 해 사용하세요. */
export async function getAllQuestions(): Promise<Question[]> {
  const q = query(
    collection(db, "questions"),
    where("isHidden", "==", false),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      title: x.title ?? "",
      content: x.content ?? "",
      category: x.category,
      createdAt: toISO(x.createdAt),
      updatedAt: toISO(x.updatedAt),
      imageUrl: x.imageUrl ?? "",
      userId: x.userId ?? "",
      answersCount: Number(x.answersCount ?? 0),
      isHidden: Boolean(x.isHidden ?? false),
    };
  });
}
