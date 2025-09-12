// ---------- 공통 래퍼 ----------
export interface KtoListResponse<TItem> {
  response?: {
    header?: {
      resultCode?: string;
      resultMsg?: string;
    };
    body?: {
      numOfRows?: number | string;
      pageNo?: number | string;
      totalCount?: number | string;
      items?: {
        item?: TItem | TItem[];
      };
    };
  };
}

// ---------- 공용 도메인 타입 ----------
export type Mode = "area" | "search" | "location";

// KTO 정렬 코드
export type ArrangeArea = "A" | "C" | "D" | "O" | "Q" | "R";
export type ArrangeLocation = "A" | "C" | "D" | "E" | "O" | "Q" | "R" | "S";
export type Arrange = ArrangeArea | ArrangeLocation;

// ---------- 목록 계열 ----------
export interface KtoAreaBasedItem {
  wellnessThemaCd?: string;
  langDivCd?: string;
  baseAddr?: string;
  detailAddr?: string;
  zipCd?: string;
  contentId?: string;
  contentTypeId?: string;
  regDt?: string;
  orgImage?: string;
  thumbImage?: string;
  cpyrhtDivCd?: string;
  mapX?: string; // 경도
  mapY?: string; // 위도
  mlevel?: string;
  mdfcnDt?: string;
  tel?: string;
  title?: string;
  lDongRegnCd?: string;
  lDongSignguCd?: string;
}

export type KtoSearchKeywordItem = KtoAreaBasedItem;
export interface KtoLocationBasedItem extends KtoAreaBasedItem {
  dist?: string;
}

// ---------- 상세 1: 공통(detailCommon) ----------
export interface KtoDetailCommonItem {
  homepage?: string; // HTML 엔티티 감싼 <a ...>
  contentId?: string;
  contentTypeId?: string;
  baseAddr?: string;
  detailAddr?: string;
  zipCd?: string;
  regDt?: string;
  mdfcnDt?: string;
  orgImage?: string;
  thumbImage?: string;
  cpyrhtDivCd?: string;
  mapX?: string; // 경도
  mapY?: string; // 위도
  mlevel?: string;
  tel?: string;
  telname?: string;
  title?: string;
  lDongRegnCd?: string;
  lDongSignguCd?: string;
  wellnessThemaCd?: string;
  overview?: string;
}

// ---------- 상세 2: 소개(detailIntro) ----------
export interface KtoDetailIntroItem {
  [key: string]: string | undefined;
}

// ---------- 상세 3: 반복(detailInfo) ----------
export interface KtoDetailInfoItem {
  [key: string]: string | undefined;
}

// ---------- 상세 4: 이미지(detailImage) ----------
export interface KtoDetailImageItem {
  thumbImage?: string;
  cpyrhtDivCd?: string;
  contentId?: string;
  imgname?: string;
  orgImage?: string;
  serialnum?: string;
}

// ---------- 앱 내에서 쓰는 정규화 타입 ----------
export type Coord = { lat: number; lng: number } | null;

export interface WellnessListItem {
  id: string;
  title: string;
  address: string;
  phone: string;
  coord: Coord;
  themeCode: string;
  image: { thumb?: string; original?: string };
  region: { sido?: string; sigungu?: string };
  homepage?: string; // withDetail=1일 때 목록 보강
}

// 내부 프록시(/api/kto/wellness, /api/kto/wellness/nearby) 공통 응답 스키마
export interface WellnessListApiResponse {
  mode: Mode;
  pageNo: number;
  numOfRows: number;
  totalCount: number;
  items: WellnessListItem[];
}

export interface WellnessDetail {
  id: string;
  title: string;
  address?: string;
  phone?: string;
  homepage?: string;
  overview: string;
  coord: Coord;
  imageList: Array<{ name?: string; original?: string; thumb?: string }>;
  introFields: Array<{ label: string; value: string }>;
  info: {
    extras: Array<{ name: string; text: string }>;
    subItems: Array<{
      name?: string;
      overview?: string;
      image?: string;
      alt?: string;
    }>;
    rooms: Array<{
      title?: string;
      size?: string;
      baseCount?: number;
      maxCount?: number;
      images: Array<{ url?: string; alt?: string }>;
    }>;
  };
}
