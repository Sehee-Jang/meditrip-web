/** ---------------- 기본 목록(hospInfoServicev2, XML) ---------------- */

export interface HiraHospBasisItem {
  yadmNm?: string;
  addr?: string;
  telno?: string;
  XPos?: string; // 경도
  YPos?: string; // 위도
  sidoCdNm?: string;
  sgguCdNm?: string;
  clCd?: string; // 92=한방병원, 93=한의원
  clCdNm?: string;
  ykiho?: string; // 암호화 요양기호(상세 키)
  hospUrl?: string; // 홈페이지
  estbDd?: string; // yyyyMMdd
}

export interface HiraHospBasisBody {
  items?: { item?: HiraHospBasisItem | HiraHospBasisItem[] } | null;
  numOfRows?: number | string;
  pageNo?: number | string;
  totalCount?: number | string;
}

export interface HiraHospBasisResponse {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: HiraHospBasisBody | null;
  };
}

export interface HiraHospBasisParams {
  pageNo?: number;
  numOfRows?: number;
  sidoCd?: string;
  sgguCd?: string;
  emdongNm?: string;
  yadmNm?: string;
  dgsbjtCd?: string;
  clCd?: string;
}

/** ---------------- 상세(v2.7, JSON/XML) 공통 ---------------- */

export interface HiraApiListResponse<T> {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      items?: { item?: T | T[] } | null;
      numOfRows?: number | string;
      pageNo?: number | string;
      totalCount?: number | string;
    } | null;
  };
}

/** v2.7 세부정보의 대표 필드(기관명/주소/전화는 빈 경우가 많음) */
export interface HiraDetailItem {
  ykiho?: string;
  yadmNm?: string;
  addr?: string;
  telno?: string;
  homepage?: string;
  estbDd?: string | number;
  clCdNm?: string;
  // 진료시간 등 다양한 운영 필드가 존재하나 여기서는 생략
}

/** 진료과목(키가 버전에 따라 조금씩 달라지므로 최소 필드만) */
export interface HiraSubjectItem {
  dgsbjtCd?: string;
  dgsbjtCdNm?: string;
  // v2.7 변형 키 대응은 매퍼에서 처리
}

/** 시설: 가변 키가 많으므로 맵 타입 */
export type HiraFacilityItem = Record<string, string | undefined>;

/** 프론트에서 쓰는 통합 상세 타입 */
export interface ClinicDetail {
  ykiho: string;
  overview: {
    name?: string;
    address?: string;
    phone?: string;
    homepage?: string;
    establishedAt?: string; // ISO yyyy-MM-dd
    typeName?: string;
    doctorCount?: number | null;
    bedCount?: number | null;
  };
  subjects: string[];
  facilities: string[];
  // 확장 필드(선택): 교통/장비
  transports?: string[];
  equipments?: string[];
}
