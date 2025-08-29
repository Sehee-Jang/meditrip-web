import type { Timestamp } from "firebase/firestore";
import type { LocaleKey } from "@/constants/locales";
import { TagSlug } from "./tag";

/** ===== 공통 ===== */
// export type Locale = "ko" | "ja";
export type ClinicCategory = "traditional" | "cosmetic" | "wellness";
export type ClinicStatus = "visible" | "hidden";
// 다국어 문서 형태
export type LocalizedTextDoc = Record<LocaleKey, string>;
export type LocalizedStringArray = Record<LocaleKey, string[]>;

// export interface LocalizedField {
//   ko: string;
//   ja: string;
// }

export interface LocalizedNumber {
  ko: number; // KRW 금액 또는 분
  ja: number; // JPY 금액 또는 분
}

export interface Geo {
  lat: number;
  lng: number;
  placeId?: string; // 중복 방지 및 정규화에 유용
  formattedAddress?: string; // 지오코딩 표준 주소(원문)
}

/** ===== 영업시간/편의시설/SNS ===== */
export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type TimeHHmm = `${number}${number}:${number}${number}`; // "09:00"
export type DailyRange = { open: TimeHHmm; close: TimeHHmm };
export type WeeklyHours = Partial<Record<DayOfWeek, DailyRange[]>>;

export type AmenityKey =
  | "parking"
  | "freeWifi"
  | "infoDesk"
  | "privateCare"
  | "airportPickup";

export type SocialPlatform = "instagram" | "line" | "whatsapp";

/** ===== 의료진 ===== */
export interface Doctor {
  /** 다국어 이름 */
  name: LocalizedTextDoc;
  /** 프로필 사진 URL */
  photoUrl?: string;
  /** 다국어 소개/경력 라인 배열 */
  lines: LocalizedStringArray;
}

/** ===== Firestore 저장용: 진료 상세설명 ===== */
export interface TreatmentStep {
  title: LocalizedTextDoc; // 예: "검사 및 검진"
  description: LocalizedTextDoc; // 예: 상세 설명
  imageUrl?: string; // Firestore에 저장된 이미지 URL
}

/** Firestore 저장용 : 패키지 (서브컬렉션) */
export interface PackageInfo {
  title: LocalizedTextDoc;
  subtitle: LocalizedTextDoc;
  price: LocalizedNumber;
  duration: LocalizedNumber;
  packageImages?: string[];
  treatmentDetails?: TreatmentStep[]; // 진료 상세 설명 (텍스트 + 이미지 포함)
  precautions?: LocalizedTextDoc; // 주의사항 텍스트
}

/** Firestore 저장용: 병원 (패키지는 서브컬렉션) */
export interface Clinic {
  // 기본정보
  id: string;
  name: LocalizedTextDoc;
  images: string[];
  category?: ClinicCategory;
  address: LocalizedTextDoc;
  tagSlugs?: TagSlug[]; // 필터용 키, 배열
  intro: {
    title: LocalizedTextDoc;
    subtitle: LocalizedTextDoc;
  };
  //의료진
  doctors?: Doctor[];
  // 영업시간
  weeklyHours?: WeeklyHours; // 요일별 영업시간
  weeklyClosedDays?: DayOfWeek[]; // 정기 휴무 요일
  hoursNote?: LocalizedTextDoc; // "매주 일요일 휴무" 등 안내문
  // 연락처
  phone?: string; // "02-745-7511" 등
  website?: string; // 클리닉 웹사이트
  socials?: Partial<Record<SocialPlatform, string>>;

  // 병원소개: 소개글, 비전, 미션, 이벤트
  description?: LocalizedTextDoc;
  vision?: LocalizedTextDoc;
  mission?: LocalizedTextDoc;
  events?: LocalizedStringArray;
  reservationNotices?: LocalizedStringArray;

  // 지도
  geo?: Geo;

  // 편의시설
  amenities?: AmenityKey[]; // 편의시설 아이콘 키

  isFavorite: boolean; // 기본 false
  rating: number; // 기본 0
  reviewCount: number; // 기본 0
  status: ClinicStatus; // 노출 제어
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // ⚠️ 과거 임베드 구조 호환을 위해 유지 (리스트/기존 화면에서만 사용)
  packages: Record<string, PackageInfo>;
}

/** ===== 저장용(서브컬렉션 기준) 타입 ===== */

/**
 * Firestore 서브컬렉션 문서 타입 (저장용)
 * - 저장 메타 포함
 */
export interface PackageDoc extends PackageInfo {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** 패키지 문서 + id/clinicId (조회용) */
export interface PackageWithId extends PackageDoc {
  id: string;
  clinicId: string;
}

/**
 * Firestore 병원 문서 타입 (저장용)
 * - id 없음
 * - 서브컬렉션 기준이므로 packages 맵은 사용 안 함
 * - 단, 마이그레이션 이전 호환을 위해 optional로 유지
 */
export interface ClinicDoc extends Omit<Clinic, "id" | "packages"> {
  /** @deprecated 임베드 패키지 맵(마이그레이션 호환용) */
  packages?: Record<string, PackageInfo>;
  /** 마이그레이션 상태/집계 마커(선택) */
  packages_migrated?: boolean;
  packageCount?: number;
}

/** 병원 문서 + id (조회용) */
export type ClinicWithId = ClinicDoc & { id: string };

/** 리스트 전용(불필요한 필드 가지치기 가능) */
export type ClinicListItem = Pick<
  ClinicWithId,
  | "id"
  | "name"
  | "address"
  | "images"
  | "rating"
  | "reviewCount"
  | "status"
  | "category"
>;

/**
 * 상세 화면 전용: 서브컬렉션에서 가져온 배열 형태 병행
 * - 기존 Clinic.packages(맵)는 그대로 두고,
 *   새 화면에서는 packagesList를 사용하도록 유도
 */
export type ClinicDetail = ClinicWithId & {
  packagesList: PackageWithId[]; // ← 새 구조
};
