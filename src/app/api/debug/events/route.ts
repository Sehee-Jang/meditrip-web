export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import * as admin from "firebase-admin";
import { getAdminApp } from "@/lib/firebaseAdmin";

type Row = {
  id: string;
  triggerType: string;
  points: number;
  condition: string;
  active: boolean;
  createdAt?: string | null;
};
type Ok = { ok: true; count: number; rows: Row[] };
type Fail = { ok: false; reason: string; detail?: string };

export async function GET(req: NextRequest): Promise<NextResponse<Ok | Fail>> {
  try {
    const url = new URL(req.url);
    const trigger = url.searchParams.get("triggerType") ?? "community_post";

    const app = getAdminApp();
    const db = admin.firestore(app);

    const snap = await db
      .collection("pointEvents")
      .where("active", "==", true)
      .where("triggerType", "==", trigger)
      .orderBy("createdAt", "desc")
      .get();

    const rows: Row[] = snap.docs.map((d) => {
      const x = d.data();
      return {
        id: d.id,
        triggerType: String(x.triggerType ?? ""),
        points: Number(x.points ?? 0),
        condition: String(x.condition ?? ""),
        active: Boolean(x.active),
        createdAt: x.createdAt?.toDate?.()?.toISOString?.() ?? null,
      };
    });

    return NextResponse.json({ ok: true, count: rows.length, rows });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, reason: "error", detail: msg },
      { status: 500 }
    );
  }
}
