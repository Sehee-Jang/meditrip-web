import type { WellnessDetail } from "@/types/kto-wellness";
import { resolveBaseUrl } from "@/utils/baseUrl";

export default async function fetchWellnessDetail(
  contentId: string,
  opts: {
    lang?: string;
    addressFallback?: string;
    phoneFallback?: string;
    homepageFallback?: string;
    contentTypeId?: string;
  } = {}
): Promise<WellnessDetail> {
  const base = resolveBaseUrl();
  const url = new URL(
    `/api/kto/wellness/${encodeURIComponent(contentId)}/detail`,
    base
  );
  const {
    lang = "ko",
    addressFallback,
    phoneFallback,
    homepageFallback,
    contentTypeId,
  } = opts;

  url.searchParams.set("lang", lang);
  if (addressFallback) url.searchParams.set("a", addressFallback);
  if (phoneFallback) url.searchParams.set("p", phoneFallback);
  if (homepageFallback) url.searchParams.set("u", homepageFallback);
  if (contentTypeId) url.searchParams.set("ct", contentTypeId);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `KTO 웰니스 상세 프록시 실패 (${res.status}): ${text.slice(0, 200)}`
    );
  }
  return (await res.json()) as WellnessDetail;
}
