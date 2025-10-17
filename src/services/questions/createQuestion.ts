import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import type { Category } from "@/types/category";
import {
  FILE_TOO_LARGE_ERROR_CODE,
  MAX_UPLOAD_FILE_SIZE,
} from "@/constants/uploads";

export interface CreateQuestionInput {
  title: string;
  category: Category;
  content: string;
  file?: File;
}

export async function uploadImageToSupabase(file: File): Promise<string> {
    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      throw new Error(FILE_TOO_LARGE_ERROR_CODE);
    }

  const ext = file.name.split(".").pop();
  const filename = `${uuidv4()}.${ext}`;
  const path = `${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("questions")
    .upload(path, file);

  if (uploadError) {
    // 서비스 레이어에서는 사용자에게 직접 노출될 문자열을 던지지 않음
    throw new Error("IMAGE_UPLOAD_FAILED");
  }

  const { data } = supabase.storage.from("questions").getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("PUBLIC_URL_FAILED");

  return data.publicUrl;
}

export async function createQuestion({
  title,
  category,
  content,
  file,
}: CreateQuestionInput): Promise<string> {
  // 1) 이미지 업로드
  let imageUrl = "";
  if (file) {
    imageUrl = await uploadImageToSupabase(file);
  }

  // 2) 현재 로그인 유저
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.isAnonymous) {
    // 호출 측에서 이미 체크하지만, 방어 로직 유지 (노출문구 아님)
    throw new Error("UNAUTHORIZED");
  }

  // 3) userId만 저장 (user 스냅샷 제거)
  const docRef = await addDoc(collection(db, "questions"), {
    title,
    category,
    content,
    imageUrl,
    userId: currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    answersCount: 0,
    hasAnswer: false,
    isHidden: false,
  });

  return docRef.id;
}
