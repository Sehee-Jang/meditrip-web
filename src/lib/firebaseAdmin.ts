import * as admin from "firebase-admin";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { getAuth, type Auth, type DecodedIdToken } from "firebase-admin/auth";
import type { NextRequest } from "next/server";

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

/** 개행/캐리지 리턴 정규화 및 흔한 오타 방어 */
function cleanPrivateKey(k: string): string {
  let key = stripWrappingQuotes(k);
  key = key.replace(/\\n/g, "\n").replace(/\\r/g, "\n").replace(/\r\n/g, "\n");
  if (key.startsWith("\\-----BEGIN ")) key = key.slice(1); // 실수 방어
  return key;
}

/**
 * Admin 자격증명 로딩
 * 우선순위:
 * 1) FIREBASE_ADMIN_CREDENTIALS_BASE64 (base64의 service account JSON)
 * 2) FIREBASE_ADMIN_CREDENTIALS (JSON 문자열)
 * 3) FIREBASE_ADMIN_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY (개별 항목)
 */
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

/** 실제 Admin 앱 초기화 (중복 초기화/레이스 방지) */
function initAdminApp(): admin.app.App {
  // 이미 초기화되어 있으면 기존 인스턴스 사용
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const sa = readAdminCreds();

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey: sa.private_key,
      }),
    });
  } catch (e) {
    // HMR 중 동시에 초기화될 수 있어 already exists 허용
    if (e instanceof Error && e.message.includes("already exists")) {
      return admin.app();
    }
    throw e;
  }
}

/** 요청 시점에 lazy 초기화 + 전역 캐시 */
export function getAdminApp(): admin.app.App {
  if (!globalThis.__FIREBASE_ADMIN_APP__) {
    globalThis.__FIREBASE_ADMIN_APP__ = initAdminApp();
  }
  return globalThis.__FIREBASE_ADMIN_APP__;
}

/** Firestore 핸들 */
export function adminDb(): Firestore {
  return getFirestore(getAdminApp());
}

/** Auth 핸들 */
export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}

/**
 * Authorization: Bearer <idToken> 헤더에서 Firebase 사용자 확인
 * - 유효하지 않은 토큰/만료 → null
 * - 환경변수 누락 → 라우트 상위에서 500 처리할 수 있게 throw 유지
 */
export async function getFirebaseUserFromRequest(
  req: NextRequest
): Promise<DecodedIdToken | null> {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;
  if (!token) return null;

  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return decoded;
  } catch (e) {
    if (e instanceof Error && e.message === "FIREBASE_ADMIN_ENV_MISSING") {
      throw e; // 상위 라우트에서 500 처리
    }
    // 만료/위조 등 일반 실패는 null
    return null;
  }
}
