import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { uploadImageToSupabase } from "./createQuestion"; // 재사용

export async function updateQuestion({
  id,
  title,
  category,
  content,
  file,
}: {
  id: string;
  title: string;
  category: string;
  content: string;
  file?: File;
}) {
  const docRef = doc(db, "questions", id);
  let imageUrl = "";

  if (file) {
    imageUrl = await uploadImageToSupabase(file);
  }

  await updateDoc(docRef, {
    title,
    category,
    content,
    ...(imageUrl && { imageUrl }),
    updatedAt: serverTimestamp(),
  });
}
