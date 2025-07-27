import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function uploadImageToSupabase(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const filename = `${uuidv4()}.${ext}`;
  const path = `${filename}`;

  // 1) upload 결과만 data, error 로 받기 (status 제거)
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("questions")
    .upload(path, file);

  if (uploadError) {
    console.error("Supabase upload error:", uploadError);
    // uploadError.status 제거, message 만 사용
    throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
  }
  // 2) getPublicUrl 은 error 가 없으므로 data 공용 URL만 가져오기
  const {
    data: { publicUrl },
  } = supabase.storage.from("questions").getPublicUrl(path);

  if (!publicUrl) {
    console.error("Supabase getPublicUrl 실패: publicUrl이 없습니다.");
    throw new Error("이미지 URL 생성 실패");
  }

  return publicUrl;
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
