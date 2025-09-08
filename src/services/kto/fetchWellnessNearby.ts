export interface NearbyOptions {
  lang?: string;
  mapX: number;
  mapY: number;
  radius?: number;
  wellnessThemaCd?: string;
  pageNo?: number;
  numOfRows?: number;
}

export default async function fetchWellnessNearby(opts: NearbyOptions) {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL &&
    process.env.NEXT_PUBLIC_BASE_URL.length > 0
      ? process.env.NEXT_PUBLIC_BASE_URL
      : process.env.NODE_ENV !== "production"
      ? "http://localhost:3000"
      : "";
  if (!base) throw new Error("NEXT_PUBLIC_BASE_URL 미설정");

  const {
    lang = "ko",
    mapX,
    mapY,
    radius = 5000,
    wellnessThemaCd,
    pageNo = 1,
    numOfRows = 12,
  } = opts;

  const url = new URL("/api/kto/wellness/nearby", base);
  url.searchParams.set("lang", lang);
  url.searchParams.set("mapX", String(mapX));
  url.searchParams.set("mapY", String(mapY));
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("pageNo", String(pageNo));
  url.searchParams.set("numOfRows", String(numOfRows));
  if (wellnessThemaCd) url.searchParams.set("wellnessThemaCd", wellnessThemaCd);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `KTO 근접 프록시 실패 (${res.status}): ${text.slice(0, 200)}`
    );
  }
  return await res.json();
}
