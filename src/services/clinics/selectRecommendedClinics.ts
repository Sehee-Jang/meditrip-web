import type { ClinicListItem } from "@/types/clinic";

type SelectRecommendedOptions = {
  take?: number; // 보여줄 개수
};

export function selectRecommendedClinics(
  clinics: ClinicListItem[],
  options: SelectRecommendedOptions = {}
): ClinicListItem[] {
  const take = options.take ?? 6;

  const recommended = clinics.filter(
    (clinic) => clinic.status === "visible" && clinic.isRecommended === true
  );

  return recommended.slice(0, take);
}
