import { NextResponse } from "next/server";
import { getAdminApp } from "@/lib/firebaseAdmin";
import type { LocalizedTagLabel, TagWithId } from "@/types/tag";
import type { Timestamp } from "firebase-admin/firestore";

function ensureLabels(raw: unknown): LocalizedTagLabel {
  const s = (raw ?? {}) as Record<string, unknown>;
  return {
    ko: typeof s.ko === "string" ? s.ko : "",
    ja: typeof s.ja === "string" ? s.ja : "",
    zh: typeof s.zh === "string" ? s.zh : "",
    en: typeof s.en === "string" ? s.en : "",
  };
}

export async function GET() {
  try {
    const app = getAdminApp();
    const db = app.firestore();
    const snap = await db.collection("tags").get();

    const items: TagWithId[] = snap.docs.map((doc) => {
      const d = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        slug: doc.id,
        labels: ensureLabels(d.labels),
        group:
          typeof d.group === "string"
            ? (d.group as TagWithId["group"])
            : undefined,
        updatedAt: (d.updatedAt as Timestamp | undefined) ?? undefined,
      };
    });

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error("/api/tags failed:", e);
    return NextResponse.json({ ok: false, error: "INTERNAL" }, { status: 500 });
  }
}
