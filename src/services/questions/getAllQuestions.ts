import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Question, Answer } from "@/types/Question";

type FirestoreTimestamp = { toDate: () => Date };

export async function getAllQuestions(): Promise<Question[]> {
  const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      title: data.title ?? "제목 없음",
      content: data.content ?? "",
      category: data.category ?? "uncategorized",
      createdAt: data.createdAt as FirestoreTimestamp,
      imageUrl: data.imageUrl ?? "",
      userId: data.userId ?? "",
      user: data.user ?? { id: "", name: "익명" },
      answers: Array.isArray(data.answers) ? (data.answers as Answer[]) : [], // answers가 없으면 빈 배열
    };
  });
}
