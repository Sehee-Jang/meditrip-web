// src/services/hira/fetchClinicDetail.ts
import type { ClinicDetail } from "@/types/hira";
import { resolveBaseUrl } from "@/utils/baseUrl";

export interface ClinicFallback {
  name?: string;
  address?: string;
  phone?: string;
  typeName?: string;
  homepage?: string;
  estbDd?: string; // yyyyMMdd
}

export default async function fetchClinicDetail(
  ykiho: string,
  fallback?: ClinicFallback
): Promise<ClinicDetail> {
  const base = resolveBaseUrl();

  const url = new URL(
    `/api/hira/clinics/${encodeURIComponent(ykiho)}/detail`,
    base
  );
  if (fallback?.name) url.searchParams.set("n", fallback.name);
  if (fallback?.address) url.searchParams.set("a", fallback.address);
  if (fallback?.phone) url.searchParams.set("p", fallback.phone);
  if (fallback?.typeName) url.searchParams.set("t", fallback.typeName);
  if (fallback?.homepage) url.searchParams.set("u", fallback.homepage);
  if (fallback?.estbDd) url.searchParams.set("e", fallback.estbDd);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `상세 프록시 호출 실패 (${res.status}): ${text.slice(0, 200)}`
    );
  }
  return (await res.json()) as ClinicDetail;
}
