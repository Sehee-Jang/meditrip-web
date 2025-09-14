// 브라우저/서버 어디서든 안전하게 절대 URL 베이스를 계산
export function resolveBaseUrl(): string {
  // 클라이언트(브라우저)
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  // 서버(Vercel) - 미리보기/프로덕션에서 제공
  const vercel = process.env.VERCEL_URL;
  if (vercel && vercel.length > 0) {
    return `https://${vercel}`;
  }

  // 수동 지정(있으면 사용)
  const manual =
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL;
  if (manual && manual.length > 0) {
    return manual;
  }

  // 로컬 기본값
  return "http://localhost:3000";
}
