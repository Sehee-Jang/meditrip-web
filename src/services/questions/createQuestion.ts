import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/firebase";

export async function uploadImageToSupabase(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const filename = `${uuidv4()}.${ext}`;
  const path = `${filename}`;

  // 1) upload 결과만 data, error 로 받기 (status 제거)
  const { error: uploadError } = await supabase.storage
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
}: {
  title: string;
  category: string;
  content: string;
  file?: File;
}) {
  // 1) 이미지 업로드 로직
  let imageUrl = "";
  if (file) {
    imageUrl = await uploadImageToSupabase(file);
  }

  // 2) 현재 로그인 유저 정보 읽어오기
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.isAnonymous) {
    throw new Error("로그인 후 작성해주세요.");
  }

  const userId = currentUser.uid;
  const user = { id: userId, name: currentUser.displayName || "익명" };

  // 3) 질문 문서 생성 시 user 객체도 함께 저장
  const docRef = await addDoc(collection(db, "questions"), {
    title,
    category,
    content,
    imageUrl,
    user,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}
