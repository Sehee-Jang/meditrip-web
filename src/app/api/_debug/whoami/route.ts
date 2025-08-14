// src/app/api/_debug/whoami/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import * as admin from "firebase-admin";
import { getAdminApp } from "@/lib/firebaseAdmin";

type Ok = {
  ok: true;
  uid: string;
  tokenAud: string | null;
  tokenIss: string | null;
  adminProjectId: string | undefined;
};
type Fail = {
  ok: false;
  reason: "disabled" | "forbidden" | "no-token" | "invalid-token" | "error";
  detail?: string;
};

function decodeJwtPayload(
  token: string
): { aud?: string; iss?: string } | null {
  try {
    const [, payload] = token.split(".");
    const json = Buffer.from(payload, "base64").toString("utf8");
    const obj = JSON.parse(json) as { aud?: string; iss?: string };
    return obj;
  } catch {
    return null;
  }
}

function isDebugEnabled(): boolean {
  // 프로덕션 완전 차단 + 프리뷰/로컬에서만 DEBUG_ROUTES=1일 때 허용
  if (process.env.VERCEL_ENV === "production") return false;
  return process.env.DEBUG_ROUTES === "1";
}

async function isAdminUid(app: admin.app.App, uid: string): Promise<boolean> {
  const snap = await admin.firestore(app).doc(`users/${uid}`).get();
  return snap.exists && snap.get("role") === "admin";
}

export async function GET(req: NextRequest): Promise<NextResponse<Ok | Fail>> {
  if (!isDebugEnabled()) {
    // 존재를 숨기기 위해 404 대신 404에 준하는 응답을 권하면 좋지만
    // 여기선 명확히 disabled를 알려줍니다.
    return NextResponse.json(
      { ok: false, reason: "disabled" },
      { status: 404 }
    );
  }

  // 추가 시크릿(프리뷰 환경변수로만 설정)
  const secret = req.headers.get("x-debug-secret");
  if (!secret || secret !== process.env.DEBUG_ROUTES_SECRET) {
    return NextResponse.json(
      { ok: false, reason: "forbidden" },
      { status: 403 }
    );
  }

  const authz = req.headers.get("authorization") ?? "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : undefined;
  if (!token) {
    return NextResponse.json(
      { ok: false, reason: "no-token" },
      { status: 401 }
    );
  }

  let app: admin.app.App;
  try {
    app = getAdminApp();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, reason: "error", detail: msg },
      { status: 500 }
    );
  }

  let decoded: admin.auth.DecodedIdToken;
  try {
    decoded = await admin.auth(app).verifyIdToken(token);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, reason: "invalid-token", detail: msg },
      { status: 401 }
    );
  }

  if (!(await isAdminUid(app, decoded.uid))) {
    return NextResponse.json(
      { ok: false, reason: "forbidden" },
      { status: 403 }
    );
  }

  const payload = decodeJwtPayload(token);
  return NextResponse.json(
    {
      ok: true,
      uid: decoded.uid,
      tokenAud: payload?.aud ?? null,
      tokenIss: payload?.iss ?? null,
      adminProjectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    },
    { status: 200 }
  );
}
