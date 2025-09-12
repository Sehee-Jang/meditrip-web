import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const raw = (process.env.KTO_SERVICE_KEY ?? "").trim();
  if (!raw) {
    return NextResponse.json(
      { ok: false, why: "NO_KTO_SERVICE_KEY" },
      { status: 500 }
    );
  }

  // env가 인코딩 키(%)인지 여부
  const envHasPercent = /%[0-9A-Fa-f]{2}/.test(raw);
  // URLSearchParams가 최종 인코딩하므로, env가 인코딩 키면 원복해서 넣는게 안전
  const decodedKey = envHasPercent ? decodeURIComponent(raw) : raw;

  const qs = new URLSearchParams();
  qs.set("serviceKey", decodedKey); // 최종 인코딩은 toString()에서 1회 수행
  qs.set("MobileOS", "ETC");
  qs.set("MobileApp", "ONYU");
  qs.set("langDivCd", "KOR");
  qs.set("contentTypeId", "12"); // 웰니스 API에서 사실상 필요
  qs.set("_type", "json");
  qs.set("pageNo", "1");
  qs.set("numOfRows", "1");

  const url = `https://apis.data.go.kr/B551011/WellnessTursmService/areaBasedList?${qs.toString()}`;
  const encodedInUrl = new URL(url).searchParams.get("serviceKey") ?? "";
  const doubleEncoded = /%25[0-9A-Fa-f]{2}/.test(encodedInUrl); // %가 또 인코딩됐는지

  const res = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": "Meditrip/1.0 (+vercel)",
    },
    cache: "no-store",
  });
  const text = await res.text();

  // 키 마스킹된 URL
  const maskedUrl = url.replace(
    /(serviceKey=)([^&]+)/,
    (_m, a, b) => `${a}${String(b).slice(0, 6)}...${String(b).slice(-4)}`
  );

  return NextResponse.json({
    ok: res.ok,
    status: res.status,
    envHasPercent,
    doubleEncoded,
    maskedUrl,
    contentType: res.headers.get("content-type"),
    sample: text.slice(0, 200), // 앞 200자만
  });
}
