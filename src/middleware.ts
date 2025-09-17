import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/**
 * next-intl 미들웨어 (로케일 프리픽스 부여/정규화)
 * - 공사중 모드 판단/처리 이후에 실행됨
 */
const nextIntlMiddleware = createMiddleware(routing);

// 프로젝트에서 사용하는 로케일 타입
type AppLocale = "ko" | "ja";

// 쿠키/경로 상수
const LOCALE_COOKIE = "NEXT_LOCALE";
const ADMIN_PREFIX = "/admin";

/**
 * 정적/시스템 경로 화이트리스트
 * - 공사중 모드여도 이 경로들은 그대로 통과
 * - API도 기본은 열어둠(필요 시 아래에서 "/api" 제거)
 */
function isPassThrough(pathname: string): boolean {
  return (
    pathname === "/maintenance" || // 공사중 페이지 자체는 그대로 통과
    pathname.startsWith("/api") || // API는 운영 모니터링/웹훅 등을 위해 기본 허용(막고 싶으면 제거)
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/assets") ||
    /\.[\w]+$/.test(pathname) // 확장자 있는 정적 파일
  );
}

/** 현재 경로가 /ko 또는 /ja로 시작하는지 */
function hasLocalePrefix(pathname: string): boolean {
  return (routing.locales as readonly string[]).some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
}

/** IP 기반 국가로 1차 로케일 추정 */
function detectFromCountry(req: NextRequest): AppLocale | undefined {
  const country =
    (
      req.headers.get("x-vercel-ip-country") ??
      req.headers.get("x-country-code") ??
      req.headers.get("cf-ipcountry")
    )?.toUpperCase() ?? "";

  if (country === "JP") return "ja";
  if (country === "KR") return "ko";
  return undefined;
}

/** Accept-Language로 보조 추정 */
function detectFromAcceptLanguage(
  header: string | null
): AppLocale | undefined {
  if (!header) return undefined;
  const lower = header.toLowerCase();
  if (lower.includes("ja")) return "ja";
  if (lower.includes("ko")) return "ko";
  return undefined;
}

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname, search, host } = url;

  // 0) 비-GET/HEAD는 리디렉트/리라이트를 피해서 부작용 최소화 (폼/업로드/웹훅 보호)
  if (req.method !== "GET" && req.method !== "HEAD") {
    return NextResponse.next();
  }

  // 1) 공사중 모드 판정 (호스트 필터 포함)
  const maintenanceOn = process.env.MAINTENANCE_MODE === "true";
  const primaryHost = process.env.PUBLIC_PRIMARY_HOST?.toLowerCase();
  const hostMatches = primaryHost ? host.toLowerCase() === primaryHost : true;

  if (maintenanceOn && hostMatches) {
    // 1-1) 정적/시스템/maintenance 자체는 통과
    if (!isPassThrough(pathname)) {
      // 1-2) 모든 문서 요청을 /maintenance로 rewrite + 503 + 캐시 방지
      const res = NextResponse.rewrite(new URL("/maintenance", req.url), {
        status: 503,
      });
      res.headers.set("Cache-Control", "no-store, max-age=0");
      return res;
    }
  }

  // 2) 국제화 제외 경로는 i18n 리다이렉트/처리를 하지 않고 통과
  if (
    pathname.startsWith(ADMIN_PREFIX) || // 관리자 경로는 로케일 프리픽스 강제하지 않음
    isPassThrough(pathname)
  ) {
    return NextResponse.next();
  }

  // 3) 이미 /ko 또는 /ja이면 next-intl에 위임
  if (hasLocalePrefix(pathname)) {
    return nextIntlMiddleware(req);
  }

  // 4) 로케일 자동 결정: IP → 쿠키 → 브라우저 → default
  const ipLocale = detectFromCountry(req);
  const cookieVal = req.cookies.get(LOCALE_COOKIE)?.value;
  const cookieLocale: AppLocale | undefined =
    cookieVal === "ko" || cookieVal === "ja"
      ? (cookieVal as AppLocale)
      : undefined;
  const acceptLocale = detectFromAcceptLanguage(
    req.headers.get("accept-language")
  );

  const target = (ipLocale ??
    cookieLocale ??
    acceptLocale ??
    routing.defaultLocale) as AppLocale;

  // 5) 해당 로케일 접두사로 리다이렉트(+쿠키 동기화)
  const to = req.nextUrl.clone();
  to.pathname = `/${target}${pathname}`;
  to.search = search;

  const res = NextResponse.redirect(to);
  res.cookies.set(LOCALE_COOKIE, target, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
/**
 * 미들웨어 적용 범위
 * - api, 정적 파일, vercel 시스템, admin 등은 제외
 * - 주의: 공사중 모드는 위에서 따로 처리하므로, 여기서 제외되더라도
 *   "공사중 모드 + host 일치"면 문서 요청은 /maintenance로 rewrite 됩니다.
 */
export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*|favicon.ico|images|assets|admin).*)",
  ],
};
