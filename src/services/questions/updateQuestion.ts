import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { uploadImageToSupabase } from "./createQuestion"; // 재사용
import type { CommunityCategory } from "@/types/category";

export interface UpdateQuestionInput {
  id: string;
  title: string;
  category: CommunityCategory;
  content: string;
  file?: File;
}

export async function updateQuestion({
  id,
  title,
  category,
  content,
  file,
}: UpdateQuestionInput): Promise<void> {
  const docRef = doc(db, "questions", id);
  let imageUrl = "";

  if (file) imageUrl = await uploadImageToSupabase(file);

  await updateDoc(docRef, {
    title,
    category,
    content,
    ...(imageUrl && { imageUrl }),
    updatedAt: serverTimestamp(),
  });
}
