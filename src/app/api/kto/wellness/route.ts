import { NextResponse } from "next/server";
import {
  getAreaBasedList,
  searchKeyword,
  getLocationBasedList,
  getDetailCommon,
  langFromLocale,
  contentTypeFor,
} from "./client";
import type {
  KtoListResponse,
  KtoAreaBasedItem,
  KtoSearchKeywordItem,
  KtoLocationBasedItem,
  KtoDetailCommonItem,
  TourListItem,
  Mode,
  ArrangeArea,
  ArrangeLocation,
} from "@/types/kto-wellness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ---------- 느슨한 items 추출 ----------
function getNested(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (typeof cur !== "object" || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}
function itemsOfLoose<T>(resp: unknown): T[] {
  const body =
    (getNested(resp, ["response", "body"]) as unknown) ??
    (getNested(resp, ["body"]) as unknown);
  if (typeof body !== "object" || body === null) return [];

  const itemsNode = (getNested(body, ["items"]) as unknown) ?? body;
  const raw =
    (typeof itemsNode === "object" && itemsNode !== null
      ? (itemsNode as Record<string, unknown>)["item"]
      : undefined) ?? itemsNode;
  if (raw == null) return [];

  if (
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    Object.keys(raw as Record<string, unknown>).length === 0
  ) {
    return [];
  }
  return Array.isArray(raw) ? (raw as T[]) : [raw as T];
}

// ---------- 타입 가드 ----------
function isArrangeArea(x: string | null): x is ArrangeArea {
  return (
    x === "A" || x === "C" || x === "D" || x === "O" || x === "Q" || x === "R"
  );
}
function isArrangeLocation(x: string | null): x is ArrangeLocation {
  return (
    x === "A" ||
    x === "C" ||
    x === "D" ||
    x === "E" ||
    x === "O" ||
    x === "Q" ||
    x === "R" ||
    x === "S"
  );
}

// ---------- 기타 유틸 ----------
function toNumberSafe(val?: string | number | null): number | undefined {
  if (val == null) return undefined;
  const n = typeof val === "number" ? val : Number(String(val));
  return Number.isFinite(n) ? n : undefined;
}

const EXCLUDED_DUPLICATE_TITLES = new Set(["한방테마파크 초락당 (艸樂堂)"]);

function filterDuplicateWellness(items: TourListItem[]): TourListItem[] {
  if (!items.length) return items;
  return items.filter((item) => {
    const title = item.title?.trim();
    if (!title) return true;
    return !EXCLUDED_DUPLICATE_TITLES.has(title);
  });
}

function joinAddress(base?: string, detail?: string): string {
  const a = (base ?? "").trim();
  const b = (detail ?? "").trim();
  return [a, b].filter(Boolean).join(" ");
}
function mapToListItem<T extends KtoAreaBasedItem>(it: T): TourListItem {
  const mapX = toNumberSafe(it.mapX);
  const mapY = toNumberSafe(it.mapY);
  const coord =
    mapX !== undefined && mapY !== undefined ? { lng: mapX, lat: mapY } : null;
  return {
    id: (it.contentId ?? "").trim(),
    title: (it.title ?? "").trim(),
    address: joinAddress(it.baseAddr, it.detailAddr),
    phone: (it.tel ?? "").trim(),
    coord,
    themeCode: (it.wellnessThemaCd ?? "").trim(),
    image: {
      original: it.orgImage || it.thumbImage,
      thumb: it.thumbImage,
    },
    region: { sido: it.lDongRegnCd, sigungu: it.lDongSignguCd },
  };
}

// ---------- homepage 파싱 ----------
function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

/** 스킴 없는 도메인(www.example.com, example.jp/path)도 https:// 보정 */
function extractHomepage(raw?: string): string | undefined {
  if (!raw) return undefined;
  const decoded = decodeEntities(raw).replace(/\s+/g, " ").trim();

  // 1) href 우선 추출
  const hrefMatch =
    decoded.match(/href\s*=\s*["']([^"'<>]+)["']/i) ||
    decoded.match(/href\s*=\s*([^"'<>]+)/i);
  const candidate = (hrefMatch?.[1] ?? hrefMatch?.[0] ?? decoded).trim();

  // 2) 완전한 URL 우선
  const urlMatch = candidate.match(/https?:\/\/[^\s"'<>]+/i);
  let url = urlMatch ? urlMatch[0] : "";

  // 3) 스킴 없는 도메인 텍스트 보정
  if (!url) {
    const text = decoded.replace(/<[^>]*>/g, "").trim();
    const domainLike = /^[\w.-]+\.[a-z]{2,}(\/[^\s]*)?$/i;
    if (domainLike.test(candidate)) url = candidate;
    else if (domainLike.test(text)) url = text;
  }
  if (!url) return undefined;

  // 4) 스킴 부여 + 정리
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  url = url.replace(/&amp;/g, "&").trim();

  try {
    return new URL(url).toString();
  } catch {
    return url;
  }
}

/** detailCommon만으로 homepage 보강 (contentTypeId 미전달) */
async function enrichHomepages(
  baseItems: TourListItem[],
  localeParam: string
): Promise<TourListItem[]> {
  if (baseItems.length === 0) return baseItems;

  const items = baseItems.slice();
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const BATCH = 4;

  for (let i = 0; i < items.length; i += BATCH) {
    const slice = items.slice(i, i + BATCH);
    const settled = await Promise.allSettled(
      slice.map((it) =>
        getDetailCommon({ contentId: it.id, locale: localeParam })
      )
    );
    for (let j = 0; j < settled.length; j++) {
      const st = settled[j];
      const idx = i + j;
      if (st.status !== "fulfilled") continue;
      const commonArr = st.value as KtoDetailCommonItem[];
      const homepage = extractHomepage(commonArr[0]?.homepage);
      if (homepage) items[idx] = { ...items[idx], homepage };
    }
    if (i + BATCH < items.length) await sleep(120);
  }
  return items;
}

// ---------- 라우트 ----------
export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;

    const withDetail =
      sp.get("withDetail") === "1" ||
      sp.get("withDetail")?.toLowerCase() === "true";

    // 언어/타입 힌트
    const langParam = sp.get("lang") ?? sp.get("locale") ?? "ko";
    const langDiv = langFromLocale(langParam);
    const contentTypeId = sp.get("contentTypeId") ?? contentTypeFor(langDiv);

    // 공통 페이지
    const pageNo = toNumberSafe(sp.get("pageNo")) ?? 1;
    const numOfRows = toNumberSafe(sp.get("numOfRows")) ?? 20;

    // 모드/정렬
    const mode = (sp.get("mode") as Mode | null) ?? "area";
    const arrangeRaw = sp.get("arrange");

    // 지역 코드
    let lDongRegnCd = sp.get("lDongRegnCd") ?? undefined;
    let lDongSignguCd = sp.get("lDongSignguCd") ?? undefined;
    const wellnessThemaCd = sp.get("wellnessThemaCd") ?? undefined;

    // 정규화: 5자리 → 2+3
    if (lDongSignguCd) {
      lDongSignguCd = lDongSignguCd.trim();
      if (lDongSignguCd.length === 5) {
        lDongRegnCd = lDongRegnCd ?? lDongSignguCd.slice(0, 2);
        lDongSignguCd = lDongSignguCd.slice(2);
      } else if (lDongSignguCd.length > 3) {
        lDongSignguCd = lDongSignguCd.slice(-3);
      }
    }

    // search
    if (mode === "search") {
      const keyword = sp.get("keyword");
      if (!keyword || !keyword.trim()) {
        return NextResponse.json(
          { error: "검색어(keyword) 필요" },
          { status: 400 }
        );
      }
      const arrange: ArrangeArea | undefined = isArrangeArea(arrangeRaw)
        ? arrangeRaw
        : undefined;

      const data = await searchKeyword({
        locale: langParam,
        keyword,
        lDongRegnCd,
        lDongSignguCd,
        wellnessThemaCd,
        arrange,
        pageNo,
        numOfRows,
        contentTypeId,
      });

      let items = itemsOfLoose<KtoSearchKeywordItem>(data)
        .filter(
          (it) => typeof it?.contentId === "string" && it.contentId.trim()
        )
        .map(mapToListItem);
      items = filterDuplicateWellness(items);
      if (withDetail) items = await enrichHomepages(items, langParam);

      const totalCount =
        toNumberSafe(
          (data as KtoListResponse<unknown>).response?.body?.totalCount
        ) ?? items.length;
      return NextResponse.json({ mode, pageNo, numOfRows, totalCount, items });
    }

    // location
    if (mode === "location") {
      const mapX = toNumberSafe(sp.get("mapX"));
      const mapY = toNumberSafe(sp.get("mapY"));
      const radius = toNumberSafe(sp.get("radius")) ?? 5000;
      if (mapX === undefined || mapY === undefined) {
        return NextResponse.json(
          { error: "위치기반 조회에는 mapX(경도), mapY(위도)가 필요합니다." },
          { status: 400 }
        );
      }
      const arrange: ArrangeLocation | undefined = isArrangeLocation(arrangeRaw)
        ? arrangeRaw
        : "E"; // 거리순

      const data = await getLocationBasedList({
        locale: langParam,
        mapX,
        mapY,
        radius,
        arrange,
        lDongRegnCd,
        lDongSignguCd,
        wellnessThemaCd,
        pageNo,
        numOfRows,
        contentTypeId,
      });

      let items = itemsOfLoose<KtoLocationBasedItem>(data)
        .filter(
          (it) => typeof it?.contentId === "string" && it.contentId.trim()
        )
        .map(mapToListItem);
      items = filterDuplicateWellness(items);
      if (withDetail) items = await enrichHomepages(items, langParam);

      const totalCount =
        toNumberSafe(
          (data as KtoListResponse<unknown>).response?.body?.totalCount
        ) ?? items.length;
      return NextResponse.json({ mode, pageNo, numOfRows, totalCount, items });
    }

    // 기본: 지역기반
    const arrange: ArrangeArea | undefined = isArrangeArea(arrangeRaw)
      ? arrangeRaw
      : undefined;

    const data = await getAreaBasedList({
      locale: langParam,
      lDongRegnCd,
      lDongSignguCd,
      wellnessThemaCd,
      arrange,
      pageNo,
      numOfRows,
      contentTypeId,
    });

    let items = itemsOfLoose<KtoAreaBasedItem>(data)
      .filter((it) => typeof it?.contentId === "string" && it.contentId.trim())
      .map(mapToListItem);
    items = filterDuplicateWellness(items);

    if (withDetail) {
      items = await enrichHomepages(items, langParam);
      items = items.map((it) => {
        if (it.homepage?.trim()) return it;
        return Object.fromEntries(
          Object.entries(it).filter(([k]) => k !== "homepage")
        ) as TourListItem;
      });
    }

    const totalCount =
      toNumberSafe(
        (data as KtoListResponse<unknown>).response?.body?.totalCount
      ) ?? items.length;

    return NextResponse.json({
      mode: "area",
      pageNo,
      numOfRows,
      totalCount,
      items,
    });
  } catch (e) {
    console.error("[/api/kto/wellness] error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown error" },
      { status: 500 }
    );
  }
}
