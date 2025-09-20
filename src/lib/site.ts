import type { LocaleKey } from "@/constants/locales";

// env 우선 → 없으면 프로덕션 기본값 → 로컬 개발 기본값
const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://www.theonyu.com"
    : "http://localhost:3000");

// 마지막 슬래시 제거(https://example.com/ ← 유지)
function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

const SITE_URL = trimTrailingSlash(RAW_SITE_URL);

export const SITE = {
  /** 배포 기본 도메인 (절대 URL 생성의 기준) */
  url: SITE_URL,

  /** 서비스/브랜드 이름 */
  name: "Meditrip",

  /** 트위터 @handle (OpenGraph/Twitter 카드에서 사용) */
  twitterSite: "@meditrip_official",

  /** 브랜드 로고(상대 경로). 절대 경로가 필요하면 absoluteUrl()로 감싸세요. */
  logoPath: "/assets/logo.png",

  /** OG 기본 이미지(상대 경로)와 권장 규격 */
  og: {
    defaultImage: "/assets/og/default-article.jpg",
    width: 1200,
    height: 630,
  },
} as const;

export type AppLocale = LocaleKey;

/** 상대 경로를 절대 URL로 변환 */
export function absoluteUrl(path: `/${string}`): string {
  return `${SITE.url}${path}`;
}

/** 이미지 경로를 절대 URL로 보정(이미 절대면 그대로 반환) */
export function toAbsoluteImageUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  // src가 공백이거나 잘못된 값이면 기본 OG 이미지로 폴백
  const safe = src && src.startsWith("/") ? src : SITE.og.defaultImage;
  return absoluteUrl(safe as `/${string}`);
}
