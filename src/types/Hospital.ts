export interface ProcessStep {
  icon: string; // 이모지나 lucide 아이콘 이름
  title: string; // 스텝 제목
}

export interface PackageDetailStep {
  title: string; // 상세 스텝 제목
  description: string; // 상세 설명
  image: string; // 이미지 URL
}

export interface Package {
  id: string;
  title: string;
  price: string;
  duration: string;
  photos: string[];
  rating: number;
  reviewCount: number;

  // ↓ 여기에 상세 정보용 필드 추가
  process?: ProcessStep[]; // 진료 프로세스
  details?: PackageDetailStep[]; // 진료 상세 정보
  cautions?: string; // 주의사항 텍스트
}

export interface Hospital {
  id: string;
  category: string;
  name: string;
  address: string;
  photos: string[];
  isFavorite: boolean;
  rating: number;
  reviewCount: number;
  packages: Package[];
}
