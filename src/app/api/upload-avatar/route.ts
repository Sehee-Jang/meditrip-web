import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getFirebaseUserFromRequest } from "@/lib/firebaseAdmin";
import {
  FILE_TOO_LARGE_ERROR_MESSAGE,
  MAX_UPLOAD_FILE_SIZE,
} from "@/constants/uploads";

export const runtime = "nodejs"; // Edge 아님
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1) Firebase 토큰 검증
    const user = await getFirebaseUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) 파일 파싱
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      return NextResponse.json(
        { error: FILE_TOO_LARGE_ERROR_MESSAGE },
        { status: 400 }
      );
    }

    // 3) Supabase 클라이언트 (Service Role)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
    if (!supabaseUrl || !serviceRole) {
      return NextResponse.json(
        { error: "Server misconfigured (SUPABASE env missing)" },
        { status: 500 }
      );
    }
    const supabase = createClient(supabaseUrl, serviceRole);

    // 업로드(덮어쓰기)
    const path = `${user.uid}.webp`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, Buffer.from(arrayBuffer), {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    const msg =
      e instanceof Error && e.message === "FIREBASE_ADMIN_ENV_MISSING"
        ? "Server misconfigured (Firebase Admin env missing)"
        : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
