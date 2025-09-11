import { NextResponse } from "next/server";
import { getLdongCode } from "../wellness/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type KtoLdongItem = {
  rnum?: string;
  name?: string;
  code?: string;
  lDongRegnCd?: string;
  lDongRegnNm?: string;
  lDongSignguCd?: string;
  lDongSignguNm?: string;
};

type KtoListResponse<T> = {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      numOfRows?: number | string;
      pageNo?: number | string;
      totalCount?: number | string;
      items?: { item?: T | T[] } | T | T[];
    };
  };
};

type Option = { label: string; value: string };

function toNumber(v: unknown, def = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : def;
}

function itemsOfLoose<T>(resp: unknown): T[] {
  const r = resp as KtoListResponse<T>;
  const body = r?.response?.body;
  const itemsNode = body?.items ?? body;
  const raw =
    typeof itemsNode === "object" && itemsNode !== null
      ? (itemsNode as { item?: T | T[] }).item ?? itemsNode
      : itemsNode;
  if (raw == null) return [];
  return Array.isArray(raw) ? (raw as T[]) : [raw as T];
}

async function fetchAllLdong(params: {
  locale: string;
  lDongRegnCd?: string;
  pageNo?: number;
  numOfRows?: number;
}) {
  const all: KtoLdongItem[] = [];
  let pageNo = params.pageNo ?? 1;
  const numOfRows = params.numOfRows ?? 1000;

  // 최대 20페이지 안전장치
  for (let i = 0; i < 20; i++) {
    const resp = (await getLdongCode({
      locale: params.locale,
      lDongRegnCd: params.lDongRegnCd,
      pageNo,
      numOfRows,
    })) as KtoListResponse<KtoLdongItem>;

    const chunk = itemsOfLoose<KtoLdongItem>(resp);
    all.push(...chunk);

    const total = toNumber(resp?.response?.body?.totalCount, chunk.length);
    const got = pageNo * numOfRows;
    if (got >= total || chunk.length === 0) break;

    pageNo += 1;
  }
  return all;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = (searchParams.get("scope") ?? "sido") as "sido" | "sigungu";
  const locale = searchParams.get("lang") ?? "ko";
  const sido = searchParams.get("sido") ?? undefined;

  try {
    // 1차: 요청받은 언어로 조회
    let all = await fetchAllLdong({
      locale,
      lDongRegnCd: scope === "sigungu" ? sido : undefined,
    });

    //  폴백: 결과가 비었고, ko가 아닐 때 한국어로 재요청
    if (all.length === 0 && locale !== "ko") {
      all = await fetchAllLdong({
        locale: "ko",
        lDongRegnCd: scope === "sigungu" ? sido : undefined,
      });
    }

    if (scope === "sido") {
      const map = new Map<string, string>();
      for (const it of all) {
        const rawCode = String(it.lDongRegnCd ?? it.code ?? "").trim();
        const name = String(it.lDongRegnNm ?? it.name ?? "").trim();
        if (!rawCode || !name) continue;
        const code2 = rawCode.length > 2 ? rawCode.slice(0, 2) : rawCode; // '36110' -> '36'
        if (!map.has(code2)) map.set(code2, name);
      }
      const options: Option[] = [{ label: "전체", value: "" }].concat(
        Array.from(map.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([code, name]) => ({ label: name, value: code }))
      );
      return NextResponse.json({ scope, options });
    }

    if (!sido) {
      return NextResponse.json(
        { error: "sido(시도 코드) 필요" },
        { status: 400 }
      );
    }
    // /ldongCode(시군구 조회)는 item에 code/name만 있음(3자리)
    const sido2 = sido.length > 2 ? sido.slice(0, 2) : sido;
    const map = new Map<string, string>();
    for (const it of all) {
      const rawLocal = String(it.lDongSignguCd ?? it.code ?? "").trim(); // 보통 3자리
      const name = String(it.lDongSignguNm ?? it.name ?? "").trim();
      if (!rawLocal || !name) continue;

      // 5자리 만들기: 3자리면 시도코드(2) + 3자리, 이미 5자리면 그대로
      const fullCode =
        rawLocal.length === 5
          ? rawLocal
          : `${sido2}${rawLocal.padStart(3, "0")}`;

      if (!map.has(fullCode)) map.set(fullCode, name);
    }

    const options: Option[] = [{ label: "전체", value: "" }].concat(
      Array.from(map.entries())
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([code, name]) => ({ label: name, value: code }))
    );

    return NextResponse.json({ scope, sido: sido2, options });
  } catch (e) {
    console.error("[/api/kto/ldong] error", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown error" },
      { status: 500 }
    );
  }
}
