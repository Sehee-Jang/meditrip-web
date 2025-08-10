import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import type { CommunityCategory } from "@/types/category";

export interface CreateQuestionInput {
  title: string;
  category: CommunityCategory;
  content: string;
  file?: File;
}

export async function uploadImageToSupabase(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const filename = `${uuidv4()}.${ext}`;
  const path = `${filename}`;

  // 1) upload 결과만 data, error 로 받기 (status 제거)
  const { error: uploadError } = await supabase.storage
    .from("questions")
    .upload(path, file);

  if (uploadError) {
    throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
  }
  // 2) getPublicUrl 은 error 가 없으므로 data 공용 URL만 가져오기
  const {
    data: { publicUrl },
  } = supabase.storage.from("questions").getPublicUrl(path);

  if (!publicUrl) throw new Error("이미지 URL 생성 실패");

  return publicUrl;
}

export async function createQuestion({
  title,
  category,
  content,
  file,
}: CreateQuestionInput): Promise<string> {
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

  // 3) userId 저장
  const userId = currentUser.uid;

  // 본인 users/{uid} 읽어서 닉네임/사진 확보(보안 규칙상 본인은 읽기 가능)
  const userSnap = await getDoc(doc(db, "users", userId));
  const userData = userSnap.exists()
    ? (userSnap.data() as Record<string, unknown>)
    : {};

  const nickname =
    (userData.nickname as string | undefined) ??
    currentUser.displayName ??
    (currentUser.email ? currentUser.email.split("@")[0] : ""); // 최소 fallback

  // photoURL 필드명 혼용 방지: question에는 photoURL 키로 저장
  const photoURL =
    (userData.photoURL as string | undefined) ??
    (userData.photoUrl as string | undefined) ??
    currentUser.photoURL ??
    "";

  // 질문 문서에 작성자 스냅샷 함께 저장
  const docRef = await addDoc(collection(db, "questions"), {
    title,
    category,
    content,
    imageUrl,
    userId,
    user: {
      id: userId,
      nickname,
      photoURL,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    answersCount: 0,
    isHidden: false,
  });

  return docRef.id;
}
