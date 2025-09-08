import { NextResponse } from "next/server";
import {
  getClinicDetailInfo,
  getClinicSubjects,
  getClinicFacilities,
  getClinicTransports,
  getClinicEquipments,
  getClinicSpecialTreats,
} from "../../../client";
import type {
  HiraDetailItem,
  HiraSubjectItem,
  HiraFacilityItem,
  ClinicDetail,
} from "@/types/hira";

/** YYYYMMDD → YYYY-MM-DD */
function toISODate(src?: string | number): string | undefined {
  if (src === undefined || src === null) return undefined;
  const s = String(src).trim();
  return s.length === 8
    ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
    : undefined;
}
function uniq<T>(arr: ReadonlyArray<T>): T[] {
  return Array.from(new Set(arr));
}

/** 빈 문자열까지 걸러내는 폴백 선택기 */
function val(v: unknown): string | undefined {
  const s = v == null ? "" : String(v).trim();
  return s.length > 0 ? s : undefined;
}
function pick(...candidates: Array<unknown>): string | undefined {
  for (const c of candidates) {
    const s = val(c);
    if (s) return s;
  }
  return undefined;
}

/** 시설 라벨 맵 & 매퍼(생략 가능) */
const facilityLabelMap: Partial<Record<string, string>> = {
  adultIcuYn: "성인중환자실",
  childrenIcuYn: "소아중환자실",
  operationRoomYn: "수술실",
  deliveryRoomYn: "분만실",
  emergencyRoomYn: "응급실",
  hospRoomYn: "입원실",
  permSbd: "허가병상",
  stdSickbd: "일반병상",
  hghrSickbd: "중환자병상",
};
function mapFacilities(raws: ReadonlyArray<HiraFacilityItem>): string[] {
  if (raws.length === 0) return [];
  const first = raws[0];
  const out: string[] = [];
  for (const [key, rawVal] of Object.entries(first)) {
    const v = String(rawVal ?? "").trim();
    if (key.endsWith("Yn")) {
      const yes =
        v === "Y" || v === "y" || v === "1" || v.toLowerCase() === "true";
      if (yes) out.push(facilityLabelMap[key] ?? key);
    } else if (key.endsWith("Cnt")) {
      const n = Number(v);
      if (!Number.isNaN(n) && n > 0) {
        const base = key.replace(/Cnt$/, "");
        out.push(`${facilityLabelMap[base] ?? base} ${n}개`);
      }
    }
  }
  return uniq(out);
}
function mapSubjects(
  subj: ReadonlyArray<HiraSubjectItem>,
  spcl: ReadonlyArray<Record<string, unknown>>
): string[] {
  const base = subj
    .map((s) =>
      String(
        (s as unknown as Record<string, unknown>).dgsbjtCdNm ??
          (s as unknown as Record<string, unknown>).dgsbjtNm ??
          (s as unknown as Record<string, unknown>).dgSbjtNm ??
          (s as unknown as Record<string, unknown>).dgSbjtCdNm ??
          (s as unknown as Record<string, unknown>).dgsbjtCd ??
          ""
      ).trim()
    )
    .filter((t) => t.length > 0);
  const extra = spcl
    .map((it) =>
      String(
        (it as Record<string, unknown>).spcDiagNm ??
          (it as Record<string, unknown>).spcMdlrtNm ??
          (it as Record<string, unknown>).spclMdlrtNm ??
          (it as Record<string, unknown>).spclMdlrtDivCdNm ??
          ""
      ).trim()
    )
    .filter((t) => t.length > 0);
  return uniq([...base, ...extra]);
}
function mapTransports(raws: ReadonlyArray<Record<string, unknown>>): string[] {
  return raws
    .map((r) => {
      const mode = String(
        (r as Record<string, unknown>).trnsprtTyNm ??
          (r as Record<string, unknown>).trnsprtSe ??
          (r as Record<string, unknown>).trnsprtTy ??
          ""
      ).trim();
      const line = String(
        (r as Record<string, unknown>).routeNo ??
          (r as Record<string, unknown>).routeNm ??
          ""
      ).trim();
      const stop = String(
        (r as Record<string, unknown>).stopNm ??
          (r as Record<string, unknown>).sttnNm ??
          (r as Record<string, unknown>).getoffStnNm ??
          ""
      ).trim();
      const parts = [mode, line, stop].filter((x) => x.length > 0);
      return parts.join(" · ");
    })
    .filter((x) => x.length > 0);
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ ykiho: string }> }
) {
  try {
    const { ykiho } = await ctx.params;
    if (!ykiho)
      return NextResponse.json({ error: "ykiho 누락" }, { status: 400 });

    const sp = new URL(req.url).searchParams;

    // v2.7 상세 병렬 호출
    const settled = await Promise.allSettled([
      getClinicDetailInfo(ykiho),
      getClinicSubjects(ykiho),
      getClinicFacilities(ykiho),
      getClinicTransports(ykiho),
      getClinicEquipments(ykiho),
      getClinicSpecialTreats(ykiho),
    ]);

    const detailList =
      settled[0].status === "fulfilled"
        ? (settled[0].value as HiraDetailItem[])
        : [];
    const subjectList =
      settled[1].status === "fulfilled"
        ? (settled[1].value as HiraSubjectItem[])
        : [];
    const facilityList =
      settled[2].status === "fulfilled"
        ? (settled[2].value as HiraFacilityItem[])
        : [];
    const transportList =
      settled[3].status === "fulfilled"
        ? (settled[3].value as Array<Record<string, unknown>>)
        : [];
    const equipList =
      settled[4].status === "fulfilled"
        ? (settled[4].value as Array<Record<string, unknown>>)
        : [];
    const spclList =
      settled[5].status === "fulfilled"
        ? (settled[5].value as Array<Record<string, unknown>>)
        : [];

    const d: HiraDetailItem | undefined = detailList[0];

    // 폴백 병합(pick) 사용 — 빈 문자열도 걸러냄
    const estbRaw = pick(d?.estbDd, sp.get("e"));
    const result: ClinicDetail = {
      ykiho,
      overview: {
        name: pick(d?.yadmNm, sp.get("n")),
        address: pick(d?.addr, sp.get("a")),
        phone: pick(d?.telno, sp.get("p")),
        homepage: pick(d?.homepage, sp.get("u")),
        establishedAt: estbRaw ? toISODate(estbRaw) : undefined,
        typeName: pick(d?.clCdNm, sp.get("t")),
        doctorCount: null,
        bedCount: null,
      },
      subjects: mapSubjects(subjectList, spclList),
      facilities: mapFacilities(facilityList),
      transports: mapTransports(transportList),
      equipments: equipList
        .map((r) =>
          String(
            (r as Record<string, unknown>).eqpNm ??
              (r as Record<string, unknown>).mdlcEqpNm ??
              (r as Record<string, unknown>).equpKndNm ??
              ""
          ).trim()
        )
        .filter((t) => t.length > 0),
    };

    return NextResponse.json(result);
  } catch (e) {
    console.error("[/api/hira/clinics/[ykiho]/detail] error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown error" },
      { status: 500 }
    );
  }
}
