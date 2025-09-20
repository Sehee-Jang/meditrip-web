import { SITE } from "@/lib/site";
import {
  LOCALES_TUPLE,
  REQUIRED_LOCALES,
  OG_LOCALE_MAP,
  type LocaleKey,
} from "@/constants/locales";

type QueryPrimitive = string | number | boolean | undefined;
type QueryValue = QueryPrimitive | QueryPrimitive[];
type QueryRecord = Record<string, QueryValue>;

//** 쿼리 객체 → ?a=1&a=2&b=3 (키 정렬 & 배열 지원) */
function toQueryString(query?: QueryRecord): string {
  if (!query) return "";
  const pairs: Array<[string, string]> = [];

  const push = (k: string, v: QueryPrimitive) => {
    if (v === undefined) return;
    pairs.push([k, String(v)]);
  };

  for (const key of Object.keys(query).sort()) {
    const val = query[key];
    if (Array.isArray(val)) val.forEach((v) => push(key, v));
    else push(key, val);
  }
  if (pairs.length === 0) return "";
  return (
    "?" +
    pairs
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&")
  );
}

/** canonical URL 생성 */
export function buildCanonicalURL(
  locale: LocaleKey,
  path: `/${string}`,
  query?: Record<string, string | number | boolean | undefined>
): string {
  const qs = toQueryString(query);
  return `${SITE.url}/${locale}${path}${qs}`;
}

/**
 * hreflang 맵 생성 (기본: REQUIRED_LOCALES 사용)
 * - 모든 지원 언어를 넣고 싶으면 locales=LOCALES_TUPLE 전달
 * - x-default를 추가하려면 addXDefault=true
 */
export function buildHreflangMap(params: {
  path: `/${string}`;
  query?: Record<string, string | number | boolean | undefined>;
  locales?: readonly LocaleKey[];
  addXDefault?: boolean;
}): Record<string, string> {
  const { path, query, addXDefault = false } = params;
  const locales = params.locales ?? REQUIRED_LOCALES;
  const map: Record<string, string> = {};
  for (const l of locales) {
    map[l] = buildCanonicalURL(l, path, query);
  }
  if (addXDefault) {
    // 정책에 맞춰 기본값을 고를 수 있다. 여기선 첫 번째 필수언어로 매핑.
    const base = locales[0] ?? LOCALES_TUPLE[0];
    map["x-default"] = buildCanonicalURL(base, path, query);
  }
  return map;
}

/** Open Graph locale 코드 (미정의 언어는 원문 locale을 그대로 반환) */
export function toOgLocale(locale: LocaleKey): string {
  return OG_LOCALE_MAP[locale] ?? locale;
}
