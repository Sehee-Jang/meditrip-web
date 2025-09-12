// src/app/api/kto/wellness/client.ts
import type {
  KtoListResponse,
  KtoAreaBasedItem,
  KtoSearchKeywordItem,
  KtoLocationBasedItem,
  KtoDetailCommonItem,
  KtoDetailIntroItem,
  KtoDetailInfoItem,
  KtoDetailImageItem,
} from "@/types/kto-wellness";
import { ktoEncodedKey, KTO_COMMON_HEADERS } from "@/utils/kto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// KTO 웰니스 전용 베이스 (공식 문서의 WellnessTursmService 계열 사용)
const BASE = "https://apis.data.go.kr/B551011/WellnessTursmService";

// --- 앱 이름(없으면 기본) ---
const APP_NAME = (process.env.KTO_APP_NAME ?? "ONYU").trim();

// --- 언어/타입 ---
export function langFromLocale(loc?: string): string {
  const s = (loc ?? "ko").toLowerCase();
  if (s.startsWith("en")) return "ENG";
  if (s.startsWith("ja") || s.startsWith("jp")) return "JPN";
  if (s.startsWith("zh") && s.includes("hant")) return "CHT";
  if (s.startsWith("zh")) return "CHS";
  if (s.startsWith("de")) return "GER";
  if (s.startsWith("fr")) return "FRE";
  if (s.startsWith("es")) return "SPN";
  if (s.startsWith("ru")) return "RUS";
  return "KOR";
}

/** 한국어 12 / 다국어 76 */
export function contentTypeFor(langDivCd: string): string {
  return langDivCd.toUpperCase() === "KOR" ? "12" : "76";
}

// --- 공통 쿼리: 항상 JSON & 인코딩된 키 ---
function qsCommon(lang: string): URLSearchParams {
  const qs = new URLSearchParams();
  // ★ Decoding 키를 1회 인코딩한 값 사용(이미 인코딩 키면 그대로)
  qs.set("serviceKey", ktoEncodedKey());
  qs.set("_type", "json");
  qs.set("MobileOS", "ETC"); // WIN 대신 ETC 권장
  qs.set("MobileApp", APP_NAME);
  qs.set("langDivCd", lang.toUpperCase());
  return qs;
}

function maskServiceKey(url: string): string {
  return url.replace(/(serviceKey=)([^&]+)/i, (_m, p1, p2) => {
    const s = String(p2);
    if (s.length <= 10) return `${p1}***`;
    return `${p1}${s.slice(0, 6)}...${s.slice(-4)}`;
  });
}

// --- XML 초간단 파서(폴백) ---
function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function parseXml<T>(xml: string): T {
  const bodyMatch = xml.match(/<body>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : "";

  const itemsNodeMatch = body.match(/<items>([\s\S]*?)<\/items>/i);
  const itemsNode = itemsNodeMatch ? itemsNodeMatch[1] : "";

  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  const items: Array<Record<string, string>> = [];
  let m: RegExpExecArray | null = null;
  while ((m = itemRegex.exec(itemsNode))) {
    const chunk = m[1];
    const obj: Record<string, string> = {};
    const fieldRegex = /<([a-zA-Z0-9]+)>([\s\S]*?)<\/\1>/g;
    let f: RegExpExecArray | null = null;
    while ((f = fieldRegex.exec(chunk))) {
      const key = f[1];
      const val = decodeEntities(f[2].trim());
      obj[key] = val;
    }
    items.push(obj);
  }

  const takeNum = (name: string): number | string | undefined => {
    const mm = body.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "i"));
    if (!mm) return undefined;
    const v = decodeEntities(mm[1].trim());
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  };

  const response = {
    response: {
      header: {
        resultCode: (
          xml.match(/<resultCode>(.*?)<\/resultCode>/i)?.[1] ?? ""
        ).trim(),
        resultMsg: (
          xml.match(/<resultMsg>(.*?)<\/resultMsg>/i)?.[1] ?? ""
        ).trim(),
      },
      body: {
        items: { item: items as unknown },
        numOfRows: takeNum("numOfRows"),
        pageNo: takeNum("pageNo"),
        totalCount: takeNum("totalCount"),
      },
    },
  } as unknown;

  return response as T;
}

// --- 공통 fetch: 헤더/타임아웃/HTML 가드/에러 메시지 ---
async function getJSONorXML<T>(url: string): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: ctrl.signal,
      headers: KTO_COMMON_HEADERS,
    });

    const ct = (res.headers.get("content-type") ?? "").toLowerCase();
    const text = await res.text();

    if (!res.ok) {
      // HTML 인증 페이지가 섞여 들어오는 경우를 위해 본문 앞 200자만 노출
      throw new Error(
        `[KTO] 요청 실패 ${res.status} @ ${maskServiceKey(url)} :: ${text.slice(
          0,
          200
        )}`
      );
    }

    // JSON 응답
    if (ct.includes("json") || /^[\s\r\n]*[{[]/.test(text)) {
      try {
        return JSON.parse(text) as T;
      } catch (e) {
        throw new Error(
          `[KTO] JSON 파싱 실패 @ ${maskServiceKey(url)} :: ${String(e).slice(
            0,
            120
          )}`
        );
      }
    }

    // XML 응답
    if (/^[\s\r\n]*</.test(text)) {
      return parseXml<T>(text);
    }

    // 알 수 없는 응답(대개 HTML)
    throw new Error(
      `[KTO] 알 수 없는 응답 @ ${maskServiceKey(url)} :: ${text.slice(0, 200)}`
    );
  } finally {
    clearTimeout(timer);
  }
}

// --- 느슨한 items 추출 ---
function getNested(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (typeof cur !== "object" || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

function itemsOfLoose<T>(resp: unknown): T[] {
  const body =
    (getNested(resp, ["response", "body"]) as unknown) ??
    (getNested(resp, ["body"]) as unknown);
  if (typeof body !== "object" || body === null) return [];

  const itemsNode = (getNested(body, ["items"]) as unknown) ?? body;
  const raw =
    (typeof itemsNode === "object" && itemsNode !== null
      ? (itemsNode as Record<string, unknown>)["item"]
      : undefined) ?? itemsNode;

  if (raw == null) return [];

  if (
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    Object.keys(raw as Record<string, unknown>).length === 0
  ) {
    return [];
  }
  return Array.isArray(raw) ? (raw as T[]) : [raw as T];
}

// ===================== 법정동 코드 API =====================
export type KtoLdongCodeItem = {
  rnum?: string;
  name?: string;
  code?: string;
  lDongRegnCd?: string;
  lDongRegnNm?: string;
  lDongSignguCd?: string;
  lDongSignguNm?: string;
};

export async function getLdongCode(params: {
  locale?: string;
  lDongRegnCd?: string;
  pageNo?: number;
  numOfRows?: number;
}): Promise<KtoListResponse<KtoLdongCodeItem>> {
  const lang = langFromLocale(params.locale);
  const qs = qsCommon(lang);

  if (params.lDongRegnCd) {
    qs.set("lDongRegnCd", params.lDongRegnCd);
  } else {
    qs.set("lDongListYn", "Y");
  }
  if (params.pageNo) qs.set("pageNo", String(params.pageNo));
  if (params.numOfRows) qs.set("numOfRows", String(params.numOfRows));

  const url = `${BASE}/ldongCode?${qs.toString()}`;
  return await getJSONorXML<KtoListResponse<KtoLdongCodeItem>>(url);
}

// ===================== 목록 API =====================

export async function getAreaBasedList(params: {
  locale?: string;
  lDongRegnCd?: string;
  lDongSignguCd?: string;
  wellnessThemaCd?: string;
  arrange?: "A" | "C" | "D" | "O" | "Q" | "R";
  pageNo?: number;
  numOfRows?: number;
  contentTypeId?: string;
}): Promise<KtoListResponse<KtoAreaBasedItem>> {
  const lang = langFromLocale(params.locale);
  const qs = qsCommon(lang);
  if (params.lDongRegnCd) qs.set("lDongRegnCd", params.lDongRegnCd);
  if (params.lDongSignguCd) qs.set("lDongSignguCd", params.lDongSignguCd);
  if (params.wellnessThemaCd) qs.set("wellnessThemaCd", params.wellnessThemaCd);
  if (params.arrange) qs.set("arrange", params.arrange);
  if (params.pageNo) qs.set("pageNo", String(params.pageNo));
  if (params.numOfRows) qs.set("numOfRows", String(params.numOfRows));
  qs.set("contentTypeId", params.contentTypeId ?? contentTypeFor(lang));
  const url = `${BASE}/areaBasedList?${qs.toString()}`;
  return await getJSONorXML<KtoListResponse<KtoAreaBasedItem>>(url);
}

export async function searchKeyword(params: {
  locale?: string;
  keyword: string;
  lDongRegnCd?: string;
  lDongSignguCd?: string;
  wellnessThemaCd?: string;
  arrange?: "A" | "C" | "D" | "O" | "Q" | "R";
  pageNo?: number;
  numOfRows?: number;
  contentTypeId?: string;
}): Promise<KtoListResponse<KtoSearchKeywordItem>> {
  const lang = langFromLocale(params.locale);
  const qs = qsCommon(lang);
  qs.set("keyword", params.keyword);
  if (params.lDongRegnCd) qs.set("lDongRegnCd", params.lDongRegnCd);
  if (params.lDongSignguCd) qs.set("lDongSignguCd", params.lDongSignguCd);
  if (params.wellnessThemaCd) qs.set("wellnessThemaCd", params.wellnessThemaCd);
  if (params.arrange) qs.set("arrange", params.arrange);
  if (params.pageNo) qs.set("pageNo", String(params.pageNo));
  if (params.numOfRows) qs.set("numOfRows", String(params.numOfRows));
  qs.set("contentTypeId", params.contentTypeId ?? contentTypeFor(lang));
  const url = `${BASE}/searchKeyword?${qs.toString()}`;
  return await getJSONorXML<KtoListResponse<KtoSearchKeywordItem>>(url);
}

export async function getLocationBasedList(params: {
  locale?: string;
  mapX: number;
  mapY: number;
  radius: number;
  arrange?: "A" | "C" | "D" | "E" | "O" | "Q" | "R" | "S";
  lDongRegnCd?: string;
  lDongSignguCd?: string;
  wellnessThemaCd?: string;
  pageNo?: number;
  numOfRows?: number;
  contentTypeId?: string;
}): Promise<KtoListResponse<KtoLocationBasedItem>> {
  const lang = langFromLocale(params.locale);
  const qs = qsCommon(lang);
  qs.set("mapX", String(params.mapX));
  qs.set("mapY", String(params.mapY));
  qs.set("radius", String(params.radius));
  if (params.arrange) qs.set("arrange", params.arrange);
  if (params.lDongRegnCd) qs.set("lDongRegnCd", params.lDongRegnCd);
  if (params.lDongSignguCd) qs.set("lDongSignguCd", params.lDongSignguCd);
  if (params.wellnessThemaCd) qs.set("wellnessThemaCd", params.wellnessThemaCd);
  if (params.pageNo) qs.set("pageNo", String(params.pageNo));
  if (params.numOfRows) qs.set("numOfRows", String(params.numOfRows));
  qs.set("contentTypeId", params.contentTypeId ?? contentTypeFor(lang));
  const url = `${BASE}/locationBasedList?${qs.toString()}`;
  return await getJSONorXML<KtoListResponse<KtoLocationBasedItem>>(url);
}

// ===================== 상세 API =====================

export async function getDetailCommon(params: {
  contentId: string;
  locale?: string;
  contentTypeId?: string;
}): Promise<KtoDetailCommonItem[]> {
  const lang = langFromLocale(params.locale);
  const qs = qsCommon(lang);
  qs.set("contentId", params.contentId);
  if (params.contentTypeId) qs.set("contentTypeId", params.contentTypeId);
  const url = `${BASE}/detailCommon?${qs.toString()}`;
  const data = await getJSONorXML<unknown>(url);
  return itemsOfLoose<KtoDetailCommonItem>(data);
}

export async function getDetailIntro(params: {
  contentId: string;
  contentTypeId: string;
  locale?: string;
}): Promise<KtoDetailIntroItem[]> {
  const lang = langFromLocale(params.locale);
  const qs = qsCommon(lang);
  qs.set("contentId", params.contentId);
  qs.set("contentTypeId", params.contentTypeId);
  const url = `${BASE}/detailIntro?${qs.toString()}`;
  const data = await getJSONorXML<unknown>(url);
  return itemsOfLoose<KtoDetailIntroItem>(data);
}

export async function getDetailInfo(params: {
  contentId: string;
  contentTypeId: string;
  locale?: string;
}): Promise<KtoDetailInfoItem[]> {
  const lang = langFromLocale(params.locale);
  const qs = qsCommon(lang);
  qs.set("contentId", params.contentId);
  qs.set("contentTypeId", params.contentTypeId);
  const url = `${BASE}/detailInfo?${qs.toString()}`;
  const data = await getJSONorXML<unknown>(url);
  return itemsOfLoose<KtoDetailInfoItem>(data);
}

export async function getDetailImage(params: {
  contentId: string;
  imageYN?: "Y" | "N";
  locale?: string;
}): Promise<KtoDetailImageItem[]> {
  const lang = langFromLocale(params.locale);
  const qs = qsCommon(lang);
  qs.set("contentId", params.contentId);
  qs.set("imageYN", params.imageYN ?? "Y");
  const url = `${BASE}/detailImage?${qs.toString()}`;
  const data = await getJSONorXML<unknown>(url);
  return itemsOfLoose<KtoDetailImageItem>(data);
}
