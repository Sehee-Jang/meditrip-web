
import mockHospitals from "@/data/mockHospitals";
import type { Hospital } from "@/types/Hospital";
import type { HospitalCategoryKey } from "@/components/common/CategoryFilter";

interface FetchOpts {
  query: string;
  category: HospitalCategoryKey | null;
}

export async function fetchHospitals(
  { query, category }: FetchOpts = { query: "", category: null }
): Promise<Hospital[]> {
  let list = mockHospitals;

  if (query.trim()) {
    const q = query.toLowerCase();
    list = list.filter((h) => h.name.toLowerCase().includes(q));
  }
  if (category && category !== "all") {
    list = list.filter((h) => h.category === category);
  }

  return Promise.resolve(list);
}
