import type { Timestamp } from "firebase/firestore";
import { TagSlug } from "./tag";
import type { CategoryKey } from "@/constants/categories";
import {
  LocalizedNumber,
  LocalizedRichTextDoc,
  LocalizedStringArray,
  LocalizedTextDoc,
} from "./common";

/** ===== 공통 ===== */
export type ClinicStatus = "visible" | "hidden";

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
  name: LocalizedTextDoc;
  photoUrl?: string;
  lines: LocalizedStringArray;
}

/** ===== 패키지 ===== */
export interface TreatmentStep {
  title: LocalizedTextDoc; // 예: "검사 및 검진"
  description: LocalizedTextDoc; // 예: 상세 설명
  imageUrl?: string; // Firestore에 저장된 이미지 URL
}

export interface PackageInfo {
  title: LocalizedTextDoc;
  subtitle: LocalizedTextDoc;
  price: LocalizedNumber;
  duration: LocalizedNumber;
  packageImages?: string[];
  treatmentDetails?: TreatmentStep[]; // 진료 상세 설명 (텍스트 + 이미지 포함)
  precautions?: LocalizedTextDoc; // 주의사항 텍스트
}

/** ===== 저장/조회 타입 ===== */
// Firestore "clinics/{id}" 문서 형태(저장용) — 레거시 packages
export interface ClinicDoc {
  name: LocalizedTextDoc;
  images: string[];
  categoryKeys?: CategoryKey[];
  address: LocalizedTextDoc;
  tagSlugs?: TagSlug[]; // 필터용 키, 배열
  intro: {
    title: LocalizedTextDoc;
    subtitle: LocalizedTextDoc;
  };
  isExclusive?: boolean;
  doctors?: Doctor[];

  // 영업시간 (선택)
  weeklyHours?: WeeklyHours;
  weeklyClosedDays?: DayOfWeek[];
  hoursNote?: LocalizedTextDoc;

  // 연락처/링크 (선택)
  phone?: string;
  website?: string;
  socials?: Partial<Record<SocialPlatform, string>>;

  description?: LocalizedRichTextDoc;
  highlights?: LocalizedRichTextDoc;
  events?: LocalizedStringArray;
  reservationNotices?: LocalizedStringArray;

  // 지도
  geo?: Geo;

  // 편의시설
  amenities?: AmenityKey[];

  isFavorite: boolean; // 기본 false
  rating: number; // 기본 0
  reviewCount: number; // 기본 0
  status: ClinicStatus; // 노출 제어
  createdAt: Timestamp;
  updatedAt: Timestamp;
  displayOrder?: number; // 기본 오름차순 정렬; 작을수록 상단
}

// 서브컬렉션 "clinics/{id}/packages/{pid}"
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
// export interface ClinicDoc extends Omit<Clinic, "id" | "packages"> {
//   /** @deprecated 임베드 패키지 맵(마이그레이션 호환용) */
//   packages?: Record<string, PackageInfo>;
//   /** 마이그레이션 상태/집계 마커(선택) */
//   packages_migrated?: boolean;
//   packageCount?: number;
// }

/** 병원 문서 + id (조회용) */
export type ClinicWithId = ClinicDoc & {
  id: string;
  createdAt?: { seconds: number; nanoseconds: number } | Date;
  updatedAt?: { seconds: number; nanoseconds: number } | Date;
};

/**
 * 상세 화면 전용: 서브컬렉션에서 가져온 배열 형태 병행
 * - 기존 Clinic.packages(맵)는 그대로 두고,
 *   새 화면에서는 packagesList를 사용하도록 유도
 */
export type ClinicDetail = ClinicWithId & {
  packagesList?: PackageWithId[]; // ← 새 구조 (선택, 지연 로딩 대응)
};

/** 리스트 전용(불필요한 필드 가지치기 가능) */
export type ClinicListItem = Pick<
  ClinicWithId,
  | "id"
  | "name"
  | "address"
  | "isExclusive"
  | "images"
  | "rating"
  | "reviewCount"
  | "status"
  | "categoryKeys"
>;
