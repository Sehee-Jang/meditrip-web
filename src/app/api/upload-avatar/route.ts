import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getFirebaseUserFromRequest } from "@/lib/firebaseAdmin";

export const runtime = "nodejs"; // Edge 아님

export async function POST(req: NextRequest) {
  try {
    const user = await getFirebaseUserFromRequest(req); // Firebase ID 토큰 검증
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE!;
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    const path = `${user.uid}.webp`;
    const arrayBuffer = await file.arrayBuffer();

    // 업로드(덮어쓰기)
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
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
