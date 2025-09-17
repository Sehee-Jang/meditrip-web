// 테마 코드(공공데이터 포털 기준) 유니언
export type TourThemeCode =
  | "EX050100" // 온천/사우나/스파
  | "EX050200" // 찜질방
  | "EX050300" // 한방 체험
  | "EX050400" // 힐링 명상
  | "EX050500" // 뷰티 스파
  | "EX050600" // 기타 웰니스
  | "EX050700"; // 자연 치유

// 테마별 기본 이미지 경로(파일은 /public에 두기)
export const TOUR_THEME_FALLBACK: Record<TourThemeCode, string> = {
  EX050100: "/images/tour-themes/ex050100.webp",
  EX050200: "/images/tour-themes/ex050200.webp",
  EX050300: "/images/tour-themes/ex050300.webp",
  EX050400: "/images/tour-themes/ex050400.webp",
  EX050500: "/images/tour-themes/ex050500.webp",
  EX050600: "/images/tour-themes/ex050600.webp",
  EX050700: "/images/tour-themes/ex050700.webp",
};

// 공통 디폴트(테마 미상/없음)
export const TOUR_IMAGE_DEFAULT = "/images/tour-themes/default.webp";
