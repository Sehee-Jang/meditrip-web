
import { parseXml } from "./xml";
import type {
  HiraHospBasisParams,
  HiraHospBasisResponse,
  HiraApiListResponse,
  HiraDetailItem,
  HiraSubjectItem,
  HiraFacilityItem,
} from "@/types/hira";

/** 기본 목록(XML) */
const HIRA_BASE_BASIS = "https://apis.data.go.kr/B551182/hospInfoServicev2";
const HIRA_BASIS_PATH = "/getHospBasisList";

/** 상세(v2.7) */
const HIRA_DETAIL_BASE =
  "https://apis.data.go.kr/B551182/MadmDtlInfoService2.7";

function itemsFromListResponse<T>(resp: HiraApiListResponse<T>): T[] {
  const raw = resp.response?.body?.items?.item;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

/* ------------- 기본 목록 ------------- */
function buildQueryBasis(params: HiraHospBasisParams): URLSearchParams {
  const qs = new URLSearchParams();
  qs.set("pageNo", String(params.pageNo ?? 1));
  qs.set("numOfRows", String(params.numOfRows ?? 100));
  if (params.sidoCd) qs.set("sidoCd", params.sidoCd);
  if (params.sgguCd) qs.set("sgguCd", params.sgguCd);
  if (params.emdongNm) qs.set("emdongNm", params.emdongNm);
  if (params.yadmNm) qs.set("yadmNm", params.yadmNm);
  if (params.dgsbjtCd) qs.set("dgsbjtCd", params.dgsbjtCd);
  if (params.clCd) qs.set("clCd", params.clCd);
  return qs;
}

function resolveServiceKey(): string {
  const raw = process.env.KTO_SERVICE_KEY;
  if (!raw) throw new Error("KTO_SERVICE_KEY 누락");

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function getHospBasisListPage(
  params: HiraHospBasisParams
): Promise<HiraHospBasisResponse> {
  const key = resolveServiceKey();

  const qs = buildQueryBasis(params);
  qs.set("serviceKey", key);
  qs.set("ServiceKey", key);

  const url = `${HIRA_BASE_BASIS}${HIRA_BASIS_PATH}?${qs.toString()}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`HIRA 응답 오류: ${res.status}`);

  const xml = await res.text();
  return parseXml<HiraHospBasisResponse>(xml);
}

/* ------------- 상세(v2.7): JSON 우선 → XML 폴백 ------------- */
async function fetchDetailList2_7<T>(
  path: string,
  ykiho: string
): Promise<T[]> {
  const key = resolveServiceKey();

  // JSON 시도
  {
    const qs = new URLSearchParams({
      _type: "json",
      serviceKey: key,
      ServiceKey: key,
      ykiho,
    });
    const url = `${HIRA_DETAIL_BASE}${path}?${qs.toString()}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (res.ok) {
      const txt = await res.text();
      try {
        const json = JSON.parse(txt) as HiraApiListResponse<T>;
        if ((json.response?.header?.resultCode ?? "") === "00") {
          return itemsFromListResponse<T>(json);
        }
      } catch {
        /* JSON 파싱 실패 → XML 폴백 진행 */
      }
    }
  }

  // XML 폴백
  {
    const qs = new URLSearchParams({
      serviceKey: key,
      ServiceKey: key,
      ykiho,
    });
    const url = `${HIRA_DETAIL_BASE}${path}?${qs.toString()}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const parsed = parseXml<HiraApiListResponse<T>>(xml);
    return itemsFromListResponse<T>(parsed);
  }
}

/* ------------- v2.7 엔드포인트 ------------- */
export async function getClinicDetailInfo(ykiho: string) {
  return fetchDetailList2_7<HiraDetailItem>("/getDtlInfo2.7", ykiho);
}
export async function getClinicSubjects(ykiho: string) {
  return fetchDetailList2_7<HiraSubjectItem>("/getDgsbjtInfo2.7", ykiho);
}
export async function getClinicFacilities(ykiho: string) {
  return fetchDetailList2_7<HiraFacilityItem>("/getEqpInfo2.7", ykiho);
}
export async function getClinicTransports(ykiho: string) {
  return fetchDetailList2_7<Record<string, string | undefined>>(
    "/getTrnsprtInfo2.7",
    ykiho
  );
}
export async function getClinicEquipments(ykiho: string) {
  return fetchDetailList2_7<Record<string, string | undefined>>(
    "/getMedOftInfo2.7",
    ykiho
  );
}
export async function getClinicSpecialTreats(ykiho: string) {
  return fetchDetailList2_7<Record<string, string | undefined>>(
    "/getSpcDiagInfo2.7",
    ykiho
  );
}
