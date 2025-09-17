// 위치기반(내 주변) 웰니스 목록 프록시 — KTO locationBasedList 호출

import { NextResponse } from "next/server";
import {
  getLocationBasedList,
  langFromLocale,
  contentTypeFor,
} from "../client";
import type {
  KtoListResponse,
  KtoLocationBasedItem,
  KtoAreaBasedItem,
  TourListItem,
  ArrangeLocation,
} from "@/types/kto-wellness";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ---- 타입 가드 ----
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

function itemsOf<T>(resp: KtoListResponse<T>): T[] {
  const raw = resp.response?.body?.items?.item;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function toNumberSafe(val?: string | number | null): number | undefined {
  if (val === undefined || val === null) return undefined;
  const n = typeof val === "number" ? val : Number(String(val));
  return Number.isFinite(n) ? n : undefined;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function joinAddress(base?: string, detail?: string): string {
  const a = (base ?? "").trim();
  const b = (detail ?? "").trim();
  return [a, b].filter(Boolean).join(" ");
}

function mapToListItem<T extends KtoAreaBasedItem>(it: T): TourListItem {
  const mapX = toNumberSafe(it.mapX); // 경도
  const mapY = toNumberSafe(it.mapY); // 위도
  const coord =
    mapX !== undefined && mapY !== undefined ? { lng: mapX, lat: mapY } : null;

  return {
    id: (it.contentId ?? "").trim(),
    title: (it.title ?? "").trim(),
    address: joinAddress(it.baseAddr, it.detailAddr),
    phone: (it.tel ?? "").trim(),
    coord,
    themeCode: (it.wellnessThemaCd ?? "").trim(),
    image: { thumb: it.thumbImage, original: it.orgImage },
    region: { sido: it.lDongRegnCd, sigungu: it.lDongSignguCd },
    // 홈페이지는 상세에서 보강
  };
}

// ---- 라우트 ----
export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;

    // 언어/타입 힌트
    const langParam = sp.get("lang") ?? sp.get("locale") ?? "ko";
    const lang = langFromLocale(langParam);
    const contentTypeId = sp.get("contentTypeId") ?? contentTypeFor(lang);

    // 필수 좌표
    const mapX = toNumberSafe(sp.get("mapX")); // 경도
    const mapY = toNumberSafe(sp.get("mapY")); // 위도
    if (mapX === undefined || mapY === undefined) {
      return NextResponse.json(
        { error: "mapX(경도), mapY(위도) 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    // 반경(기본 5km, 최대 20km)
    const radiusRaw = toNumberSafe(sp.get("radius")) ?? 5000;
    const radius = clamp(radiusRaw, 1, 20000);

    // 선택 파라미터
    const pageNo = toNumberSafe(sp.get("pageNo")) ?? 1;
    const numOfRows = toNumberSafe(sp.get("numOfRows")) ?? 12;
    const wellnessThemaCd = sp.get("wellnessThemaCd") ?? undefined;

    // 정렬 — 기본값: 거리순(E). 이미지 보장 거리순은 S.
    const arrangeRaw = sp.get("arrange");
    const arrange: ArrangeLocation | undefined = isArrangeLocation(arrangeRaw)
      ? arrangeRaw
      : "E";

    // 호출
    const data = await getLocationBasedList({
      locale: lang,
      mapX,
      mapY,
      radius,
      arrange,
      wellnessThemaCd,
      pageNo,
      numOfRows,
      contentTypeId,
    });

    // 정규화
    const items = itemsOf<KtoLocationBasedItem>(data).map(mapToListItem);
    const totalCount =
      toNumberSafe(data.response?.body?.totalCount) ?? items.length;

    return NextResponse.json({
      mode: "location",
      pageNo,
      numOfRows,
      totalCount,
      items,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[/api/kto/wellness/nearby] error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown error" },
      { status: 500 }
    );
  }
}
