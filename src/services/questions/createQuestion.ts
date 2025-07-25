import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function uploadImageToSupabase(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const filename = `${uuidv4()}.${ext}`;
  const path = `questions/${filename}`;

  const { error } = await supabase.storage.from("questions").upload(path, file);
  if (error) throw new Error("이미지 업로드 실패");

  const { data } = supabase.storage.from("questions").getPublicUrl(path);
  return data.publicUrl;
}

export async function createQuestion({
  title,
  category,
  content,
  file,
  userId,
}: {
  title: string;
  category: string;
  content: string;
  file?: File;
  userId: string;
}) {
  let imageUrl = "";
  if (file) {
    imageUrl = await uploadImageToSupabase(file);
  }

  const docRef = await addDoc(collection(db, "questions"), {
    title,
    category,
    content,
    imageUrl,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}
