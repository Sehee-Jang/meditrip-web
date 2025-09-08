// src/services/hira/fetchClinics.ts

type Coord = { lat: number; lng: number } | null;

export type ClinicItem = {
  name: string;
  address: string;
  phone: string;
  homepage: string;
  estbDd: string; // yyyyMMdd
  coord: Coord;
  ykiho: string;
  clCd: string;
  clCdNm: string;
};

export type ClinicListResponse = { items: ClinicItem[] };

export interface FetchOrientalClinicsOptions {
  numOfRows?: number;
  sidoCd?: string;
  sgguCd?: string;
  emdongNm?: string;
  yadmNm?: string;
}

export default async function fetchOrientalClinics(
  opts: FetchOrientalClinicsOptions = {}
): Promise<ClinicListResponse> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL &&
    process.env.NEXT_PUBLIC_BASE_URL.length > 0
      ? process.env.NEXT_PUBLIC_BASE_URL
      : process.env.NODE_ENV !== "production"
      ? "http://localhost:3000"
      : "";

  if (!base) throw new Error("환경변수 NEXT_PUBLIC_BASE_URL 미설정");

  const url = new URL("/api/hira/clinics", base);
  const { numOfRows = 50, sidoCd, sgguCd, emdongNm, yadmNm } = opts;

  url.searchParams.set("numOfRows", String(numOfRows));
  if (sidoCd) url.searchParams.set("sidoCd", sidoCd);
  if (sgguCd) url.searchParams.set("sgguCd", sgguCd);
  if (emdongNm) url.searchParams.set("emdongNm", emdongNm);
  if (yadmNm) url.searchParams.set("yadmNm", yadmNm);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `HIRA 프록시 호출 실패 (${res.status}): ${text.slice(0, 200)}`
    );
  }
  return (await res.json()) as ClinicListResponse;
}
