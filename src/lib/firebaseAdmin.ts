import { NextRequest } from "next/server";
import * as admin from "firebase-admin";

let app: admin.app.App | null = null;

function getEnv(name: string): string | undefined {
  const v = process.env[name];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function normalizePrivateKey(key: string): string {
  return key.includes("\\n") ? key.replace(/\\n/g, "\n") : key;
}

/** 요청 시점에만 초기화 */
export function getAdminApp(): admin.app.App {
  if (app) return app;

  const projectId = getEnv("FIREBASE_ADMIN_PROJECT_ID");
  const clientEmail = getEnv("FIREBASE_ADMIN_CLIENT_EMAIL");
  const rawKey = getEnv("FIREBASE_ADMIN_PRIVATE_KEY");

  if (!projectId || !clientEmail || !rawKey) {
    // 빌드 시점에 throw되지 않도록, 라우트에서 try/catch로 처리
    throw new Error("FIREBASE_ADMIN_ENV_MISSING");
  }

  const privateKey = normalizePrivateKey(rawKey);

  app = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });

  return app;
}

export async function getFirebaseUserFromRequest(
  req: NextRequest
): Promise<admin.auth.DecodedIdToken | null> {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;
  if (!token) return null;

  try {
    const a = getAdminApp();
    const decoded = await admin.auth(a).verifyIdToken(token);
    return decoded;
  } catch (e) {
    // env 누락은 라우트로 전파해서 500 처리
    if (e instanceof Error && e.message === "FIREBASE_ADMIN_ENV_MISSING") {
      throw e;
    }
    // 그 외(만료/형식 오류 등)는 인증 실패로 처리
    return null;
  }
}
