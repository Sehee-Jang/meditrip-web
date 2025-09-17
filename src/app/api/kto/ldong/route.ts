import { NextResponse } from "next/server";
import { getLdongCode } from "../wellness/client";
import {
  KtoLdongCodeItem,
  KtoLdongCodeItemResponse,
} from "@/types/kto-wellness";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Option = { label: string; value: string };

const LDONG_CACHE_TTL = 1000 * 60 * 10; // 10분

type LdongCacheEntry = {
  expires: number;
  data: KtoLdongCodeItem[];
};

const ldongCache = new Map<string, LdongCacheEntry>();

function getLdongCacheKey(locale: string, lDongRegnCd?: string) {
  const normalizedLocale = (locale ?? "").toLowerCase();
  const normalizedRegion = (lDongRegnCd ?? "").trim();
  return `${normalizedLocale}::${normalizedRegion}`;
}

function pruneExpiredLdongCache(now = Date.now()) {
  for (const [key, entry] of ldongCache.entries()) {
    if (entry.expires <= now) {
      ldongCache.delete(key);
    }
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

// 느슨한 items 추출(원본 유지)
function itemsOfLoose<T>(resp: unknown): T[] {
  const body = (resp as KtoLdongCodeItemResponse<T>)?.response?.body;

  // body.items ?? body
  const node: unknown =
    isRecord(body) && "items" in body
      ? (body as Record<string, unknown>).items
      : body;

  // Array ? Array : (node.item ?? node)
  const raw: unknown = Array.isArray(node)
    ? node
    : isRecord(node) && "item" in node
    ? (node as Record<string, unknown>).item
    : node;

  if (raw == null) return [];
  return Array.isArray(raw) ? (raw as T[]) : [raw as T];
}

function allLabel(lang: string) {
  const s = (lang || "ko").toLowerCase();
  if (s.startsWith("ja")) return "すべて";
  if (s.startsWith("en")) return "All";
  if (s.startsWith("zh")) return "全部";
  return "전체";
}
const collator = (lang: string) =>
  new Intl.Collator(
    lang.startsWith("ja")
      ? "ja-JP"
      : lang.startsWith("en")
      ? "en"
      : lang.startsWith("zh")
      ? "zh-CN"
      : "ko-KR"
  );

async function fetchAllLdong(params: {
  locale: string;
  lDongRegnCd?: string;
  pageNo?: number;
  numOfRows?: number;
}) {
  const key = getLdongCacheKey(params.locale, params.lDongRegnCd);
  const now = Date.now();
  pruneExpiredLdongCache(now);

  const cached = ldongCache.get(key);
  if (cached) {
    return cached.data.map((item) => ({ ...item }));
  }

  const all: KtoLdongCodeItem[] = [];
  let pageNo = params.pageNo ?? 1;
  const numOfRows = params.numOfRows ?? 1000;

  // 최대 20페이지 안전장치
  for (let i = 0; i < 20; i++) {
    const resp = await getLdongCode({
      locale: params.locale,
      lDongRegnCd: params.lDongRegnCd,
      pageNo,
      numOfRows,
    });

    const chunk = itemsOfLoose<KtoLdongCodeItem>(resp);
    all.push(...chunk);

    // any 제거: totalCount 안전 변환
    const totalRaw = resp.response?.body?.totalCount;
    const total =
      typeof totalRaw === "number"
        ? totalRaw
        : Number(totalRaw ?? chunk.length);

    if (pageNo * numOfRows >= total || chunk.length === 0) break;
    pageNo += 1;
  }
  const expires = Date.now() + LDONG_CACHE_TTL;
  const dataToCache = all.map((item) => ({ ...item }));
  ldongCache.set(key, { expires, data: dataToCache });
  
  return all;
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const scope = (sp.get("scope") ?? "sido") as "sido" | "sigungu";
  const lang = sp.get("lang") ?? "ko";
  const sido = sp.get("sido") ?? undefined;

  try {
    // 1차: 요청받은 언어로 조회
    let all = await fetchAllLdong({
      locale: lang,
      lDongRegnCd: scope === "sigungu" ? sido : undefined,
    });

    // 폴백: 결과 없음 + ko가 아닐 때 한국어로 재요청
    if (all.length === 0 && lang !== "ko") {
      all = await fetchAllLdong({
        locale: "ko",
        lDongRegnCd: scope === "sigungu" ? sido : undefined,
      });
    }

    const cmp = collator(lang);

    if (scope === "sido") {
      const map = new Map<string, string>();
      for (const it of all) {
        const rawCode = String(it.lDongRegnCd ?? it.code ?? "").trim();
        const name = String(it.lDongRegnNm ?? it.name ?? "").trim();
        if (!rawCode || !name) continue;
        const code2 = rawCode.length > 2 ? rawCode.slice(0, 2) : rawCode;
        if (!map.has(code2)) map.set(code2, name);
      }
      const list = Array.from(map.entries())
        .map(([code, name]) => ({ value: code, label: name }))
        .sort((a, b) => cmp.compare(a.label, b.label));

      const options: Option[] = [{ label: allLabel(lang), value: "" }, ...list];
      const items = list.map(({ value, label }) => ({
        code: value,
        name: label,
      }));

      return NextResponse.json({ scope, options, items, lang });
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
      const rawLocal = String(it.lDongSignguCd ?? it.code ?? "").trim();
      const name = String(it.lDongSignguNm ?? it.name ?? "").trim();
      if (!rawLocal || !name) continue;
      const fullCode =
        rawLocal.length === 5
          ? rawLocal
          : `${sido2}${rawLocal.padStart(3, "0")}`;
      if (!map.has(fullCode)) map.set(fullCode, name);
    }

    const list = Array.from(map.entries())
      .map(([code, name]) => ({ value: code, label: name }))
      .sort((a, b) => cmp.compare(a.label, b.label));

    const options: Option[] = [{ label: allLabel(lang), value: "" }, ...list];
    const items = list.map(({ value, label }) => ({
      code: value,
      name: label,
      parent: sido2,
    }));

    return NextResponse.json({ scope, sido: sido2, options, items, lang });
  } catch (e) {
    // 불필요한 eslint-disable 제거
    console.error("[/api/kto/ldong] error", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown error" },
      { status: 500 }
    );
  }
}
