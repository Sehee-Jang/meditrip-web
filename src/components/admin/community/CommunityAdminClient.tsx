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
  COMMUNITY_CATEGORY_KEYS,
  COMMUNITY_CATEGORY_LABELS,
} from "@/constants/communityCategories";

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
            ...COMMUNITY_CATEGORY_KEYS.map((k) => ({
              value: k,
              label: COMMUNITY_CATEGORY_LABELS[k],
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
