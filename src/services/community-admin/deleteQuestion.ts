import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { supabase } from "@/lib/supabase";

export async function deleteQuestion(questionId: string): Promise<void> {
  const ref = doc(db, "questions", questionId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const imageUrl: string | undefined = snap.data().imageUrl;
  await deleteDoc(ref);

  if (imageUrl) {
    // 저장소 경로 룰에 맞춰 파싱
    const url = new URL(imageUrl);
    const path = decodeURIComponent(url.pathname.split("/").slice(-1)[0]); // 예: 파일명.ext
    await supabase.storage.from("questions").remove([path]);
  }
}
