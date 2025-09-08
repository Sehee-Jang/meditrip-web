import { NextResponse } from "next/server";
import { getHospBasisListPage } from "../client";
import type { HiraHospBasisItem, HiraHospBasisResponse } from "@/types/hira";
interface Query {
  pageNo?: number;
  numOfRows?: number;
  sidoCd?: string;
  sgguCd?: string;
  emdongNm?: string;
  yadmNm?: string;
  dgsbjtCd?: string;
}

function pickStr(...c: Array<unknown>): string | undefined {
  for (const v of c) {
    const s = v == null ? "" : String(v).trim();
    if (s) return s;
  }
  return undefined;
}
function normalizeUrl(u?: string): string {
  if (!u) return "";
  let s = u.trim();
  if (!s) return "";
  // 스킴이 없으면 https로 보정
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  return s;
}

function itemsOf(resp: HiraHospBasisResponse): HiraHospBasisItem[] {
  const raw = resp.response?.body?.items?.item;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function dedupeByKey(
  items: ReadonlyArray<HiraHospBasisItem>
): HiraHospBasisItem[] {
  const seen = new Set<string>();
  const out: HiraHospBasisItem[] = [];
  for (const it of items) {
    const key =
      it.ykiho && it.ykiho.trim().length > 0
        ? `ykiho:${it.ykiho}`
        : `na:${(it.yadmNm ?? "").trim()}|${(it.addr ?? "").trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q: Query = {
      pageNo: searchParams.get("pageNo")
        ? Number(searchParams.get("pageNo"))
        : undefined,
      numOfRows: searchParams.get("numOfRows")
        ? Number(searchParams.get("numOfRows"))
        : undefined,
      sidoCd: searchParams.get("sidoCd") ?? undefined,
      sgguCd: searchParams.get("sgguCd") ?? undefined,
      emdongNm: searchParams.get("emdongNm") ?? undefined,
      yadmNm: searchParams.get("yadmNm") ?? undefined,
      dgsbjtCd: searchParams.get("dgsbjtCd") ?? undefined,
    };

    const common = {
      pageNo: q.pageNo ?? 1,
      numOfRows: q.numOfRows ?? 50,
      sidoCd: q.sidoCd,
      sgguCd: q.sgguCd,
      emdongNm: q.emdongNm,
      yadmNm: q.yadmNm,
      dgsbjtCd: q.dgsbjtCd,
    };

    // 한방병원(92) + 한의원(93)
    const [r92, r93] = await Promise.all([
      getHospBasisListPage({ ...common, clCd: "92" }),
      getHospBasisListPage({ ...common, clCd: "93" }),
    ]);

    const merged = dedupeByKey([...itemsOf(r92), ...itemsOf(r93)]);

    const items = merged.map((it) => {
      const hasXY =
        it.XPos !== undefined &&
        it.YPos !== undefined &&
        String(it.XPos).trim().length > 0 &&
        String(it.YPos).trim().length > 0;

      const anyIt = it as unknown as Record<string, unknown>;
      const homepageRaw = pickStr(
        anyIt.hospUrl, // 가장 흔함
        anyIt.hmpgAddr, // 다른 데이터셋에서 자주 보이는 키
        anyIt.hospUrlAddr // 일부 샘플에서 보이는 변형
      );
      const homepage = normalizeUrl(homepageRaw);

      return {
        name: it.yadmNm ?? "",
        phone: it.telno ?? "",
        address: it.addr ?? "",
        homepage,
        estbDd: it.estbDd ?? "", // yyyyMMdd
        coord: hasXY ? { lng: Number(it.XPos), lat: Number(it.YPos) } : null,
        region: { sido: it.sidoCdNm ?? "", sggu: it.sgguCdNm ?? "" },
        clCd: it.clCd ?? "",
        clCdNm: it.clCdNm ?? "",
        ykiho: it.ykiho ?? "",
      };
    });

    return NextResponse.json({
      totalCount: items.length,
      pageNo: common.pageNo,
      numOfRows: common.numOfRows,
      items,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[/api/hira/clinics] error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown error" },
      { status: 500 }
    );
  }
}
