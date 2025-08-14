import * as admin from "firebase-admin";
import { NextRequest } from "next/server";

type ServiceAccountLike = {
  project_id: string;
  client_email: string;
  private_key: string;
};

// dev/HMR에서도 살아남는 전역 캐시
declare global {
  // eslint-disable-next-line no-var
  var __FIREBASE_ADMIN_APP__: admin.app.App | undefined;
}

function stripWrappingQuotes(s: string): string {
  const t = s.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

function cleanPrivateKey(k: string): string {
  let key = stripWrappingQuotes(k);
  key = key.replace(/\\n/g, "\n").replace(/\\r/g, "\n").replace(/\r\n/g, "\n");
  if (key.startsWith("\\-----BEGIN ")) key = key.slice(1); // 실수 방어
  return key;
}

function readAdminCreds(): ServiceAccountLike {
  const b64 = process.env.FIREBASE_ADMIN_CREDENTIALS_BASE64;
  if (b64) {
    const json = Buffer.from(b64, "base64").toString("utf8");
    const parsed = JSON.parse(json) as ServiceAccountLike;
    return {
      project_id: parsed.project_id,
      client_email: parsed.client_email,
      private_key: cleanPrivateKey(parsed.private_key),
    };
  }

  const rawJson = process.env.FIREBASE_ADMIN_CREDENTIALS;
  if (rawJson) {
    const parsed = JSON.parse(
      stripWrappingQuotes(rawJson)
    ) as ServiceAccountLike;
    return {
      project_id: parsed.project_id,
      client_email: parsed.client_email,
      private_key: cleanPrivateKey(parsed.private_key),
    };
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID ?? "";
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "";
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "";
  if (!projectId || !clientEmail || !rawKey) {
    throw new Error("FIREBASE_ADMIN_ENV_MISSING");
  }
  return {
    project_id: projectId,
    client_email: clientEmail,
    private_key: cleanPrivateKey(rawKey),
  };
}

function initAdminApp(): admin.app.App {
  const sa = readAdminCreds();

  // 이름 없는 default 앱을 우선 사용(이미 있으면 재사용)
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // race(동시 초기화) 대비: duplicate-app 캐치
  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey: sa.private_key,
      }),
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes("already exists")) {
      return admin.app();
    }
    throw e;
  }
}

/** 요청 시점에만 초기화 (전역 캐시) */
export function getAdminApp(): admin.app.App {
  if (!globalThis.__FIREBASE_ADMIN_APP__) {
    globalThis.__FIREBASE_ADMIN_APP__ = initAdminApp();
  }
  return globalThis.__FIREBASE_ADMIN_APP__;
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
    if (e instanceof Error && e.message === "FIREBASE_ADMIN_ENV_MISSING") {
      throw e; // 라우트에서 500 처리
    }
    // 그 외(만료/형식 오류 등)는 인증 실패로 처리
    return null;
  }
}
