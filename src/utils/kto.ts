// KTO(OpenAPI) 서비스키를 안전하게 인코딩해 반환
// - 퍼센트 없는 Decoding 키 → encodeURIComponent 1회
// - 이미 퍼센트 포함(Encoding 키) → 그대로 사용(재인코딩 금지)
export function ktoEncodedKey(): string {
  const raw = (
    process.env.KTO_SERVICE_KEY ??
    process.env.TOURAPI_SERVICE_KEY ??
    process.env.NEXT_PUBLIC_KTO_SERVICE_KEY ??
    ""
  ).trim();

  if (!raw) throw new Error("Missing KTO_SERVICE_KEY");

  const hasPercent = /%[0-9A-Fa-f]{2}/.test(raw);
  return hasPercent ? raw : encodeURIComponent(raw);
}

// 공통 요청 헤더 (일부 게이트웨이가 UA/Accept 없으면 HTML 인증 페이지로 응답하는 걸 방지)
export const KTO_COMMON_HEADERS: Record<string, string> = {
  Accept: "application/json, text/plain, */*",
  "User-Agent": "Meditrip/1.0 (+vercel)",
};
