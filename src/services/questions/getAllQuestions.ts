import { db } from "@/lib/firebase";
import { getDocs, collection, doc, getDoc } from "firebase/firestore";
import { Question } from "@/types/question";
import { User } from "@/types/user";

export async function getAllQuestions(): Promise<Question[]> {
  const snapshot = await getDocs(collection(db, "questions"));
  const questions = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      let user = null;

      if (data.userId) {
        const userSnap = await getDoc(doc(db, "users", data.userId));
        if (userSnap.exists()) {
          user = userSnap.data() as User;
        }
      }

      return {
        id: docSnap.id,
        ...data,
        user, // 유저 정보 포함
      } as Question;
    })
  );

  return questions;
}
