import type { WellnessListItem } from "@/types/kto-wellness";

export interface FetchWellnessOptions {
  lang?: string;
  pageNo?: number;
  numOfRows?: number;
  lDongRegnCd?: string;
  lDongSignguCd?: string;
  wellnessThemaCd?: string;
  arrange?: "A" | "C" | "D" | "O" | "Q" | "R";
  mode?: "area" | "search" | "location";
  keyword?: string;
  withDetail?: boolean;
  mapX?: number;
  mapY?: number;
  radius?: number;
}

export interface WellnessListResponse {
  totalCount: number;
  pageNo: number;
  numOfRows: number;
  items: WellnessListItem[];
  mode?: string;
}

export default async function fetchWellness(
  opts: FetchWellnessOptions = {}
): Promise<WellnessListResponse> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL &&
    process.env.NEXT_PUBLIC_BASE_URL.length > 0
      ? process.env.NEXT_PUBLIC_BASE_URL
      : process.env.NODE_ENV !== "production"
      ? "http://localhost:3000"
      : "";

  if (!base) throw new Error("NEXT_PUBLIC_BASE_URL 미설정");

  const url = new URL("/api/kto/wellness", base);

  const {
    lang = "ko",
    pageNo = 1,
    numOfRows = 12,
    lDongRegnCd,
    lDongSignguCd,
    wellnessThemaCd,
    arrange = "C",
    mode = "area",
    keyword,
    withDetail,
    mapX,
    mapY,
    radius,
  } = opts;

  url.searchParams.set("lang", lang);
  url.searchParams.set("pageNo", String(pageNo));
  url.searchParams.set("numOfRows", String(numOfRows));
  url.searchParams.set("mode", mode);
  url.searchParams.set("arrange", arrange);
  if (withDetail) url.searchParams.set("withDetail", "1");
  if (lDongRegnCd) url.searchParams.set("lDongRegnCd", lDongRegnCd);
  if (lDongSignguCd) url.searchParams.set("lDongSignguCd", lDongSignguCd);
  if (wellnessThemaCd) url.searchParams.set("wellnessThemaCd", wellnessThemaCd);
  if (mode === "search" && keyword) url.searchParams.set("keyword", keyword);
  if (mode === "location") {
    if (typeof mapX === "number") url.searchParams.set("mapX", String(mapX));
    if (typeof mapY === "number") url.searchParams.set("mapY", String(mapY));
    if (typeof radius === "number")
      url.searchParams.set("radius", String(radius));
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `KTO 웰니스 목록 프록시 실패 (${res.status}): ${text.slice(0, 200)}`
    );
  }
  return (await res.json()) as WellnessListResponse;
}
