// 사용처 구분용 키 (필요 시 여기에만 추가)
export type StoragePreset =
  | "clinics"   // 병원/클리닉
  | "packages"  // 병원 패키지(클리닉 하위)
  | "questions" // 커뮤니티 질문
  | "avatars"   // 유저 프로필 이미지
  | "wellness"; // K-웰니스 콘텐츠



// 프리셋별 기본 버킷/디렉터리 매핑
// - 버킷명은 4개로 고정(hospitals, questions, avatars, wellness)
// - 디렉터리는 버킷 내부의 하위 폴더(프리픽스)만 지정
export const STORAGE_PRESETS = {
  clinics:   { bucket: "hospitals", dir: "clinics" },
  packages:  { bucket: "hospitals", dir: "clinics/packages" },
  questions: { bucket: "questions", dir: "questions" },
  avatars:   { bucket: "avatars",  dir: "users" },      // 기본 users/ 아래에 저장(UID로 세분 권장)
  wellness:  { bucket: "wellness", dir: "contents" },   // wellness/contents/...
} as const satisfies Record<
  StoragePreset,
  { bucket: string; dir: string }
>;


// 프리셋과 수동 지정(bucket/dir)을 합쳐 최종 적용값을 계산
export function resolveStorage(
  preset?: StoragePreset,
  bucket?: string,
  dir?: string
): { bucket: string; dir: string } {
  const p = preset ? STORAGE_PRESETS[preset] : undefined;
  return {
    bucket: bucket ?? p?.bucket ?? "wellness", // 프리셋/인자 없으면 wellness 버킷으로 폴백
    dir: dir ?? p?.dir ?? "misc", // 폴더 폴백
  };
}


// (선택) 외부에서 사용할 때 타입 추론이 편하도록 별칭 제공
export type ResolvedStorage = ReturnType<typeof resolveStorage>;