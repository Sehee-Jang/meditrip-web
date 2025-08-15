// 로컬 디버그 전용: Admin SDK로 email의 provider들을 확인
import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export const runtime = "nodejs"; // Edge가 아니라 Node 강제
export const dynamic = "force-dynamic"; // 캐시 방지

function initAdmin(): App {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID ?? "";
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "";
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "";
  const privateKey = rawKey.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing FIREBASE_ADMIN_* env vars");
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
  }
  return getApps()[0]!;
}

type Success = {
  adminProjectId: string | null;
  uid: string;
  email: string | null;
  providers: string[];
  providerEmails: string[];
  disabled: boolean;
};

type Failure =
  | { error: "forbidden" }
  | { error: "email-required" }
  | { error: "not-found" }
  | { error: "server-error"; message: string };

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const body: Failure = { error: "forbidden" };
    return NextResponse.json(body, { status: 403 });
  }

  let email = "";
  try {
    const json = (await req.json()) as { email?: string };
    email = (json.email ?? "").trim().toLowerCase();
    if (!email) {
      const body: Failure = { error: "email-required" };
      return NextResponse.json(body, { status: 400 });
    }

    const app = initAdmin();
    const user = await getAuth(app).getUserByEmail(email);

    const providers = user.providerData.map((p) => p.providerId);
    const providerEmails = user.providerData
      .map((p) => p.email)
      .filter((e): e is string => typeof e === "string");

    const body: Success = {
      adminProjectId: app.options.projectId ?? null,
      uid: user.uid,
      email: user.email ?? null,
      providers, // 예: ["google.com"]
      providerEmails, // 예: ["seheejang.korea@gmail.com"]
      disabled: user.disabled ?? false,
    };
    return NextResponse.json(body, { status: 200 });
  } catch (e) {
    // 서버 콘솔에 상세 원인 기록
    // eslint-disable-next-line no-console
    console.error("[_debug/auth] error for email:", email, e);
    const msg = e instanceof Error ? e.message : "unknown";
    const isNotFound =
      msg.includes("no user record") || msg.includes("NOT_FOUND");
    const body: Failure = isNotFound
      ? { error: "not-found" }
      : { error: "server-error", message: msg };
    return NextResponse.json(body, { status: isNotFound ? 404 : 500 });
  }
}
