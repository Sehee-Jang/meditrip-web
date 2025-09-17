"use client";

import { useState } from "react";
import CommunityAdminTable from "./table/CommunityAdminTable";
import {
  type AdminFilter,
  type CategoryFilter,
} from "@/features/community/admin/filters";
import {
  FilterRow,
  SelectFilter,
  AnsweredSelect,
  VisibilitySelect,
} from "@/components/admin/common/FilterControls";
import {
  CATEGORY_KEYS,
  CATEGORY_LABELS_KO,
  type CategoryKey,
} from "@/constants/categories";

export default function CommunityAdminClient({
  initialFilter,
}: {
  initialFilter: AdminFilter;
}) {
  const [category, setCategory] = useState<CategoryFilter>(
    initialFilter.category
  );
  const [answered, setAnswered] = useState<"all" | "yes" | "no">(
    initialFilter.answered ?? "all"
  );
  const [visibility, setVisibility] = useState<"all" | "visible" | "hidden">(
    initialFilter.visibility ?? "all"
  );

  return (
    <div className='space-y-4'>
      {/* 필터 선택 영역 */}
      <FilterRow>
        <SelectFilter<CategoryFilter>
          value={category}
          onChange={setCategory}
          options={[
            { value: "all", label: "전체 카테고리" },
            ...CATEGORY_KEYS.map((k: CategoryKey) => ({
              value: k,
              label: CATEGORY_LABELS_KO[k],
            })),
          ]}
        />
        <AnsweredSelect value={answered} onChange={setAnswered} />
        <VisibilitySelect value={visibility} onChange={setVisibility} />
      </FilterRow>

      <CommunityAdminTable filter={{ category, answered, visibility }} />
    </div>
  );
}
