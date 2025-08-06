export type Locale = "ko" | "ja";

export interface LocalizedField {
  ko: string;
  ja: string;
}

export interface TreatmentStep {
  title: LocalizedField; // 예: "검사 및 검진"
  description: LocalizedField; // 예: 상세 설명
  imageUrl?: string; // Firestore에 저장된 이미지 URL
}

export interface PackageInfo {
  title: LocalizedField;
  subtitle: LocalizedField;
  price: LocalizedField;
  duration: LocalizedField;
  packageImages?: string[];

  treatmentDetails?: TreatmentStep[]; // 진료 상세 설명 (텍스트 + 이미지 포함)
  precautions?: LocalizedField; // 주의사항 텍스트
}

export interface Clinic {
  id: string;
  name: LocalizedField;
  address: LocalizedField;
  intro: {
    title: LocalizedField;
    subtitle: LocalizedField;
  };

  vision: LocalizedField;
  mission: LocalizedField;
  description: LocalizedField;
  events: {
    ko: string[];
    ja: string[];
  };
  isFavorite: boolean;
  rating: number;
  reviewCount: number;
  packages: {
    [key: string]: PackageInfo;
  };
  images: string[];
}
