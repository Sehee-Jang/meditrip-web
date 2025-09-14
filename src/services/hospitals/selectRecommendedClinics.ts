import type { ClinicListItem } from "@/types/clinic";

type SelectRecommendedOptions = {
  take?: number; // 보여줄 개수
};

export function selectRecommendedClinics(
  clinics: ClinicListItem[],
  options: SelectRecommendedOptions = {}
): ClinicListItem[] {
  const take = options.take ?? 6;

  // 노출 상태 확인
  const visible = clinics.filter((c) => c.status === "visible");

  // 우선순위: rating ↓, reviewCount ↓
  const sorted = [...visible].sort((a, b) => {
    const ra = typeof a.rating === "number" ? a.rating : 0;
    const rb = typeof b.rating === "number" ? b.rating : 0;
    if (rb !== ra) return rb - ra;
    const ca = typeof a.reviewCount === "number" ? a.reviewCount : 0;
    const cb = typeof b.reviewCount === "number" ? b.reviewCount : 0;
    return cb - ca;
  });

  return sorted.slice(0, take);
}
