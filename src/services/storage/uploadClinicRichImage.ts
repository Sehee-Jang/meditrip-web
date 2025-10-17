import { createClient } from "@supabase/supabase-js";
import {
  FILE_TOO_LARGE_ERROR_CODE,
  MAX_UPLOAD_FILE_SIZE,
} from "@/constants/uploads";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const BUCKET = "clinics-rich";

export async function uploadClinicRichImage(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_FILE_SIZE) {
    throw new Error(FILE_TOO_LARGE_ERROR_CODE);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 파일명: 날짜폴더/랜덤
  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `rich/${new Date()
    .toISOString()
    .slice(0, 10)}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(key, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/*",
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl; // 이 URL을 tiptap 이미지 src로 넣음
}
