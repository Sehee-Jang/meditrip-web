import { NextResponse } from "next/server";
import {
  getDetailCommon,
  getDetailImage,
  getDetailIntro,
  getDetailInfo,
  contentTypeFor,
  langFromLocale,
} from "../../client";
import type {
  WellnessDetail,
  KtoDetailIntroItem,
  KtoDetailInfoItem,
  KtoDetailCommonItem,
} from "@/types/kto-wellness";

// ---------- 유틸 ----------
function decodeHtmlEntitiesOnce(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}
function decodeHtmlEntitiesDeep(s: string): string {
  let prev = s;
  for (let i = 0; i < 2; i++) {
    const next = decodeHtmlEntitiesOnce(prev);
    if (next === prev) break;
    prev = next;
  }
  return prev;
}
function normalizeUrlBare(u?: string): string {
  if (!u) return "";
  let s = u.trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  return s;
}
/** 홈페이지 URL 추출(비표준 href도 대응) */
function extractHomepage(u?: string): string {
  if (!u) return "";
  const s = decodeHtmlEntitiesDeep(u).trim().replace(/\s+/g, " ");
  const mHref =
    s.match(/href\s*=\s*(['"])(https?:\/\/[^\s"'<>]+)\1/i) ||
    s.match(/href\s*=\s*(https?:\/\/[^\s"'<>]+)/i);
  const urlFromHref = (mHref?.[2] ?? mHref?.[1]) as string | undefined;
  if (urlFromHref) return normalizeUrlBare(urlFromHref);
  const mUrl = s.match(/https?:\/\/[^\s"'<>]+/i);
  if (mUrl?.[0]) return normalizeUrlBare(mUrl[0]);
  const mWww = s.match(/\bwww\.[^\s"'<>]+/i);
  if (mWww?.[0]) return normalizeUrlBare(mWww[0]);
  return "";
}
function pickStr(...vals: Array<unknown>): string | undefined {
  for (const v of vals) {
    const s = (v ?? "").toString().trim();
    if (s) return s;
  }
  return undefined;
}
function toNumber(n?: string): number | undefined {
  if (!n) return undefined;
  const x = Number(n);
  return Number.isFinite(x) ? x : undefined;
}
function normalizeIntro(
  item: KtoDetailIntroItem | undefined
): Array<{ label: string; value: string }> {
  if (!item) return [];
  const labels: Array<{ label: string; key: string | string[] }> = [
    {
      label: "이용시간",
      key: ["usetime", "usetimeculture", "usetimefood", "usetimeleports"],
    },
    {
      label: "휴무일",
      key: [
        "restdate",
        "restdateculture",
        "restdatefood",
        "restdateleports",
        "restdateshopping",
      ],
    },
    {
      label: "개장일",
      key: ["opendate", "opendatefood", "opentimefood", "opentime"],
    },
    {
      label: "주차",
      key: [
        "parking",
        "parkingculture",
        "parkingfood",
        "parkingleports",
        "parkingshopping",
        "parkingtraffic",
        "parkinglodging",
      ],
    },
    { label: "주차요금", key: ["parkingfee", "parkingfeeleports"] },
    { label: "이용요금", key: ["usefee", "usefeeleports"] },
    {
      label: "예약",
      key: [
        "reservation",
        "reservationurl",
        "reservationlodging",
        "bookingplace",
      ],
    },
    {
      label: "문의",
      key: [
        "infocenter",
        "infocenterculture",
        "infocenterfood",
        "infocenterleports",
        "infocentershopping",
        "infocenterlodging",
        "infocentertraffic",
        "foreignerinfocenter",
      ],
    },
    {
      label: "규모/시설",
      key: [
        "scale",
        "scaleshopping",
        "scalefood",
        "scaleleports",
        "scalelodging",
      ],
    },
    { label: "소요시간", key: ["spendtime", "spendtimefestival"] },
    { label: "행사기간", key: ["eventstartdate", "eventenddate"] },
    { label: "행사장소", key: ["eventplace"] },
    { label: "프로그램", key: ["program"] },
    {
      label: "메뉴",
      key: ["treatmenu", "firstmenu", "saleitem", "saleitemcost"],
    },
    {
      label: "편의시설",
      key: [
        "conven",
        "subfacility",
        "publicbath",
        "sauna",
        "fitness",
        "karaoke",
        "beverage",
        "beauty",
        "barbecue",
      ],
    },
    { label: "환불규정", key: ["refundregulation"] },
    { label: "기타", key: ["expguide", "agelimit", "kidsfacility", "smoking"] },
  ];
  const out: Array<{ label: string; value: string }> = [];
  for (const row of labels) {
    const keys = Array.isArray(row.key) ? row.key : [row.key];
    for (const k of keys) {
      const v = (item[k] ?? "").trim();
      if (v) {
        out.push({ label: row.label, value: v });
        break;
      }
    }
  }
  return out;
}
function normalizeInfo(items: ReadonlyArray<KtoDetailInfoItem>) {
  const extras: Array<{ name: string; text: string }> = [];
  const subItems: Array<{
    name?: string;
    overview?: string;
    image?: string;
    alt?: string;
  }> = [];
  const rooms: Array<{
    title?: string;
    size?: string;
    baseCount?: number;
    maxCount?: number;
    images: Array<{ url?: string; alt?: string }>;
  }> = [];

  for (const it of items) {
    const infoname = (it["infoname"] ?? "").trim();
    const infotext = (it["infotext"] ?? "").trim();
    if (infoname && infotext) extras.push({ name: infoname, text: infotext });

    const subname = (it["subname"] ?? "").trim();
    const subdetailimg = (it["subdetailimg"] ?? "").trim();
    const subdetailoverview = (it["subdetailoverview"] ?? "").trim();
    const subdetailalt = (it["subdetailalt"] ?? "").trim();
    if (subname || subdetailimg || subdetailoverview) {
      subItems.push({
        name: subname || undefined,
        overview: subdetailoverview || undefined,
        image: subdetailimg || undefined,
        alt: subdetailalt || undefined,
      });
    }

    const roomtitle = (it["roomtitle"] ?? "").trim();
    const roomsize2 = (it["roomsize2"] ?? "").trim();
    const roombasecount = toNumber((it["roombasecount"] ?? "").trim());
    const roommaxcount = toNumber((it["roommaxcount"] ?? "").trim());
    const imgs: Array<{ url?: string; alt?: string }> = [];
    for (let i = 1; i <= 5; i++) {
      const url = (it[`roomimg${i}`] ?? "").trim();
      const alt = (it[`roomimg${i}alt`] ?? "").trim();
      if (url) imgs.push({ url, alt: alt || undefined });
    }
    if (roomtitle || imgs.length) {
      rooms.push({
        title: roomtitle || undefined,
        size: roomsize2 || undefined,
        baseCount: roombasecount,
        maxCount: roommaxcount,
        images: imgs,
      });
    }
  }

  return { extras, subItems, rooms };
}

async function ensureCommon(
  contentId: string,
  langParam: string,
  ctHint?: string
): Promise<KtoDetailCommonItem | undefined> {
  // 0) no-ct
  const arr = await getDetailCommon({ contentId, locale: langParam });
  if (arr[0]?.contentId) return arr[0];

  const candidates = Array.from(
    new Set(
      [ctHint, "12", "76"].filter(
        (ct): ct is string => typeof ct === "string" && ct.length > 0
      )
    )
  );

  if (candidates.length === 0) return undefined;

  const settled = await Promise.allSettled(
    candidates.map((contentTypeId) =>
      getDetailCommon({ contentId, locale: langParam, contentTypeId })
    )
  );

  for (const result of settled) {
    if (result.status === "fulfilled") {
      const [item] = result.value;
      if (item?.contentId) return item;
    }
  }
  return undefined;
}

// ---------- 라우트 ----------
export async function GET(
  req: Request,
  ctx: { params: Promise<{ contentId: string }> }
) {
  try {
    const { contentId } = await ctx.params;
    const sp = new URL(req.url).searchParams;

    const langParam = sp.get("lang") ?? "ko";
    const langDiv = langFromLocale(langParam);
    const ctHint =
      sp.get("ct") || sp.get("contentTypeId") || contentTypeFor(langDiv);
    const debug = sp.get("debug") === "1";

    const [images] = await Promise.all([
      getDetailImage({ contentId, locale: langParam, imageYN: "Y" }),
    ]);

    const c = await ensureCommon(contentId, langParam, ctHint);

    const ct = c?.contentTypeId || ctHint;
    const [introArr, infoArr] = await Promise.all([
      ct
        ? getDetailIntro({ contentId, contentTypeId: ct, locale: langParam })
        : Promise.resolve([]),
      ct
        ? getDetailInfo({ contentId, contentTypeId: ct, locale: langParam })
        : Promise.resolve([]),
    ]);

    const lng = c?.mapX ? Number(c.mapX) : NaN;
    const lat = c?.mapY ? Number(c.mapY) : NaN;
    const coord =
      Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;

    const addressApi = [c?.baseAddr ?? "", c?.detailAddr ?? ""]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");

    const homepageRaw = c?.homepage ?? "";
    const homepageParsed = extractHomepage(homepageRaw);

    const detail: WellnessDetail = {
      id: contentId,
      title: c?.title ?? "",
      address: pickStr(addressApi, sp.get("a")),
      phone: pickStr(c?.tel, sp.get("p")),
      homepage: pickStr(homepageParsed, sp.get("u")),
      overview: c?.overview ?? "",
      coord,
      imageList: images.map((im) => ({
        name: im.imgname ?? "",
        original: im.orgImage ?? "",
        thumb: im.thumbImage ?? "",
      })),
      introFields: normalizeIntro(introArr[0]),
      info: normalizeInfo(infoArr),
    };

    if (debug) {
      return NextResponse.json({
        ...detail,
        __debug: {
          commonRaw: c,
          addressApi,
          homepageRaw,
          homepageParsed,
          ctUsed: ct,
        },
      });
    }

    return NextResponse.json(detail);
  } catch (e) {
    console.error("[/api/kto/wellness/[contentId]/detail] error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown error" },
      { status: 500 }
    );
  }
}
