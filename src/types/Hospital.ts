// 허용 가능한 카테고리 열거
export type HospitalCategory = "traditional" | "cosmetic" | "wellness";

// 개별 진료 패키지 정보
export interface HospitalPackage {
  /** 패키지 고유 ID */
  id: string;
  /** 패키지명 (i18n 메시지에서 관리) */
  title: string;
  /** 가격(표시용, ex. "80만 원") */
  price: string;
  /** 시간(표시용, ex. "90분") */
  duration: string;
  /** 패키지 대표 이미지들 */
  photos: string[];
  /** (동적) 패키지별 평점 */
  rating?: number;
  /** (동적) 패키지별 리뷰 개수 */
  reviewCount?: number;
}

// 병원 기본/정적 정보
export interface HospitalStatic {
  /** 병원 고유 ID */
  id: string;
  /** 진료 카테고리 */
  category: HospitalCategory;
  /** 병원명 (i18n 메시지에서 관리) */
  name: string;
  /** 한 줄 주소 (i18n 메시지에서 관리) */
  address: string;
  /** 병원 대표 이미지들 */
  photos: string[];
}

// 병원 동적 피드백 정보
export interface HospitalDetail {
  /** 즐겨찾기 여부 */
  isFavorite: boolean;
  /** 전체 병원 평점 */
  rating: number;
  /** 전체 리뷰 개수 */
  reviewCount: number;
  /** 여러 개의 진료 패키지 정보 */
  packages: HospitalPackage[];
}

// 전체 병원 객체 타입
export type Hospital = HospitalStatic & HospitalDetail;
