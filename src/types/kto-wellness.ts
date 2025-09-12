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

export interface KtoLdongCodeItemResponse<T> {
  response?: {
    header?: {
      resultCode?: string;
      resultMsg?: string;
    };
    body?: {
      numOfRows?: number | string;
      pageNo?: number | string;
      totalCount?: number | string;
      items?: { item?: T | T[] } | T | T[];
    };
  };
}

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

// ---------- 법정동 코드(ldongCode) ----------
export interface KtoLdongCodeItem {
  rnum?: string;
  // 시도 목록일 때
  code?: string; // 시도 코드
  name?: string; // 시도 이름
  // 시군구 목록일 때
  lDongRegnCd?: string; // 시도 코드
  lDongRegnNm?: string; // 시도 이름
  lDongSignguCd?: string; // 시군구 코드
  lDongSignguNm?: string; // 시군구 이름
}

// UI에서 쓰는 정규화 타입
export type SidoOption = { code: string; name: string };
export type SigunguOption = { code: string; name: string; parent: string };

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

// ---------- 투어 테마 라벨(다국어) ----------
export const TOUR_THEME_LABELS: Record<
  string,
  Partial<Record<"KOR" | "ENG" | "JPN" | "CHS" | "CHT", string>>
> = {
  EX050100: {
    KOR: "온천/사우나/스파",
    ENG: "Hot spring/Sauna/Spa",
    JPN: "温泉/サウナ/スパ",
    CHS: "温泉/桑拿/水疗",
    CHT: "溫泉/桑拿/SPA",
  },
  EX050200: {
    KOR: "찜질방",
    ENG: "Jjimjilbang",
    JPN: "チムジルバン",
    CHS: "汗蒸房",
    CHT: "汗蒸幕",
  },
  EX050300: {
    KOR: "한방 체험",
    ENG: "Korean Medicine",
    JPN: "韓方体験",
    CHS: "韩医体验",
    CHT: "韓方體驗",
  },
  EX050400: {
    KOR: "힐링 명상",
    ENG: "Healing/Meditation",
    JPN: "ヒーリング/瞑想",
    CHS: "疗愈/冥想",
    CHT: "療癒/冥想",
  },
  EX050500: {
    KOR: "뷰티 스파",
    ENG: "Beauty Spa",
    JPN: "ビューティスパ",
    CHS: "美容水疗",
    CHT: "美顏SPA",
  },
  EX050600: {
    KOR: "기타 웰니스",
    ENG: "Other Wellness",
    JPN: "その他ウェルネス",
    CHS: "其他身心健康",
    CHT: "其他健康",
  },
  EX050700: {
    KOR: "자연 치유",
    ENG: "Nature Therapy",
    JPN: "自然治癒",
    CHS: "自然治愈",
    CHT: "自然療癒",
  },
};
