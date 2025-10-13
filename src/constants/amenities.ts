import type { AmenityKey } from "@/types/clinic";

export const AMENITY_LABELS_KO: Record<AmenityKey, string> = {
  parking: "주차",
  freeWifi: "무료 Wi-Fi",
  infoDesk: "안내 데스크",
  privateCare: "프라이빗 케어",
  airportPickup: "공항 픽업",
};

export function getAmenityLabelKo(key: AmenityKey): string {
  return AMENITY_LABELS_KO[key] ?? key;
}
