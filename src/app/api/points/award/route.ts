import { NextResponse, type NextRequest } from "next/server";
import * as admin from "firebase-admin";
import { getAdminApp } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EventTriggerType =
  | "community_post"
  | "community_comment"
  | "clinic_review"
  | "login_daily"
  | "consultation_request";

type EventCondition = "firstPostOnly" | "oncePerDay" | "unlimited";
type PointEventDoc = {
  active: boolean;
  condition: EventCondition;
  createdAt?: admin.firestore.Timestamp | null;
  description?: string;
  points: number;
  triggerType: EventTriggerType;
};
type AwardBody = {
  triggerType: EventTriggerType;
  subjectId?: string; // community_post => questionId 등
  idToken?: string;
};

type ApiOk = { ok: true; awarded: boolean; points?: number; logId?: string };
type ApiFail = {
  ok: false;
  reason:
    | "no-token"
    | "invalid-args"
    | "invalid-token"
    | "no-active-event"
    | "not-found"
    | "forbidden"
    | "error";
  detail?: string;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    const json = Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// Asia/Seoul 기준 YYYYMMDD 키
function ymdInSeoul(d: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // "2025-08-13" 형태 → yyyymmdd
  const s = fmt.format(d).replaceAll("-", "");
  return s;
}

// 이벤트 조건별 멱등 로그ID 생성
function buildLogId(
  trigger: EventTriggerType,
  condition: EventCondition,
  subjectId?: string
): string {
  switch (condition) {
    case "firstPostOnly":
      return `first_${trigger}`;
    case "oncePerDay":
      return `daily_${trigger}_${ymdInSeoul()}`;
    case "unlimited":
      // 같은 대상(subjectId)에 대해 중복 적립 방지
      return `subject_${trigger}_${subjectId ?? "none"}`;
  }
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiOk | ApiFail>> {
  // 1) 바디/토큰
  let body: AwardBody | null = null;
  try {
    body = (await req.json()) as AwardBody;
  } catch {
    body = null;
  }

  const authz = req.headers.get("authorization") ?? "";
  const headerToken = authz.startsWith("Bearer ") ? authz.slice(7) : undefined;
  const idToken = headerToken ?? body?.idToken;
  if (!idToken) {
    return NextResponse.json(
      { ok: false, reason: "no-token" },
      { status: 401 }
    );
  }

  const triggerType = body?.triggerType;
  if (!triggerType) {
    return NextResponse.json(
      { ok: false, reason: "invalid-args", detail: "missing triggerType" },
      { status: 400 }
    );
  }

  let app: admin.app.App;
  try {
    app = getAdminApp();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, reason: "error", detail: `admin-init: ${msg}` },
      { status: 500 }
    );
  }

  let uid: string;
  try {
    const decoded = await admin.auth(app).verifyIdToken(idToken);
    uid = decoded.uid;
  } catch (e) {
    const payload = decodeJwtPayload(idToken);
    const msg = e instanceof Error ? e.message : String(e);
    console.error(
      "[award] verifyIdToken failed:",
      msg,
      payload?.aud,
      payload?.iss
    );
    return NextResponse.json(
      { ok: false, reason: "invalid-token", detail: msg },
      { status: 401 }
    );
  }

  const db = admin.firestore(app);

  // 2) 활성 이벤트 조회 (해당 triggerType)
  // equalities만 사용(인덱스 필요성 최소화)
  let evSnap;
  try {
    evSnap = await db
      .collection("pointEvents")
      .where("active", "==", true)
      .where("triggerType", "==", triggerType)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, reason: "error", detail: `query-events: ${msg}` },
      { status: 500 }
    );
  }

  if (evSnap.empty) {
    // 활성 이벤트 없음 → 지급하지 않지만 성공으로 돌려도 무방
    return NextResponse.json({ ok: true, awarded: false }, { status: 200 });
  }

  // 가장 최근 생성(또는 임의) 1건 선택
  const evDoc = evSnap.docs[0];
  const pickedData = evDoc.data() as PointEventDoc;
  const picked = {
    id: evDoc.id,
    ...pickedData,
  };

  const points = Number(picked.points ?? 0);
  const condition = picked.condition;

  // 3) 트리거별 유효성 검사(커뮤니티 글 작성은 본인 글만)
  const subjectId = body?.subjectId;
  if (triggerType === "community_post") {
    if (!subjectId) {
      return NextResponse.json(
        { ok: false, reason: "invalid-args", detail: "missing subjectId" },
        { status: 400 }
      );
    }
    const qRef = db.doc(`questions/${subjectId}`);
    const qSnap = await qRef.get();
    if (!qSnap.exists) {
      return NextResponse.json(
        { ok: false, reason: "not-found", detail: "question missing" },
        { status: 404 }
      );
    }
    const authorId = qSnap.get("userId") as string | undefined;
    if (authorId !== uid) {
      return NextResponse.json(
        {
          ok: false,
          reason: "forbidden",
          detail: `authorId=${authorId} uid=${uid}`,
        },
        { status: 403 }
      );
    }
  }
  // TODO: 다른 트리거는 필요 시 유효성 검사를 이 블록처럼 추가

  // 4) 멱등 로그ID
  const logId = buildLogId(triggerType, condition, subjectId);
  const userRef = db.doc(`users/${uid}`);
  const logRef = db.doc(`users/${uid}/pointLogs/${logId}`);

  // 5) 트랜잭션: 멱등 보장 + 포인트 증가 + 로그 생성
  try {
    await db.runTransaction(async (tx) => {
      const [logSnap, userSnap] = await Promise.all([
        tx.get(logRef),
        tx.get(userRef),
      ]);
      if (logSnap.exists) return; // 이미 지급

      tx.set(logRef, {
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        description: picked.description ?? "이벤트 보상",
        eventId: picked.id,
        points,
        triggerType,
        subjectId: subjectId ?? null,
        condition,
      });

      if (userSnap.exists) {
        tx.update(userRef, {
          points: admin.firestore.FieldValue.increment(points),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        tx.set(
          userRef,
          {
            uid,
            points,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    });

    return NextResponse.json(
      { ok: true, awarded: true, points, logId },
      { status: 200 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/points/award] tx error:", msg);
    return NextResponse.json(
      { ok: false, reason: "error", detail: msg },
      { status: 500 }
    );
  }
}
