// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const nextIntlMiddleware = createMiddleware(routing);

type AppLocale = "ko" | "ja";
const LOCALE_COOKIE = "NEXT_LOCALE";
const ADMIN_PREFIX = "/admin";

function hasLocalePrefix(pathname: string): boolean {
  return (routing.locales as readonly string[]).some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
}

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
  const { pathname, search } = req.nextUrl;

  // 0) 비-GET/HEAD 요청은 로케일 리다이렉트/처리를 하지 않음 (API/폼 제출 보호)
  if (req.method !== "GET" && req.method !== "HEAD") {
    return NextResponse.next();
  }

  // 1) 국제화 대상 제외 경로: API/정적/관리자 등
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.startsWith(ADMIN_PREFIX) ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/assets") ||
    /\.[\w]+$/.test(pathname) // 파일 확장자
  ) {
    return NextResponse.next();
  }

  // 2) 이미 /ko 또는 /ja면 next-intl에 위임
  if (hasLocalePrefix(pathname)) {
    return nextIntlMiddleware(req);
  }

  // 3) 우선순위: IP → 쿠키 → 브라우저 → default
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

  const url = req.nextUrl.clone();
  url.pathname = `/${target}${pathname}`;
  url.search = search;

  const res = NextResponse.redirect(url);
  // 쿠키 동기화(선택)
  res.cookies.set(LOCALE_COOKIE, target, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}

export const config = {
  // 미들웨어 자체가 실행될 경로를 제한 (여기서도 /api, 정적, /admin 제외)
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*|favicon.ico|images|assets|admin).*)",
  ],
};
