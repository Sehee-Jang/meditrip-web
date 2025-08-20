"use client";

import { useState } from "react";
import CommunityAdminTable from "./table/CommunityAdminTable";
import {
  type AdminFilter,
  type CategoryFilter,
} from "@/features/community/admin/filters";
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
      <div className='flex flex-wrap gap-3 items-center'>
        <select
          className='border rounded px-3 py-2'
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryFilter)}
        >
          <option value='all'>전체 카테고리</option>
          {COMMUNITY_CATEGORY_KEYS.map((k) => (
            <option key={k} value={k}>
              {COMMUNITY_CATEGORY_LABELS[k]}
            </option>
          ))}
        </select>

        <select
          className='border rounded px-3 py-2'
          value={answered}
          onChange={(e) => setAnswered(e.target.value as "all" | "yes" | "no")}
        >
          <option value='all'>답변여부(전체)</option>
          <option value='yes'>답변완료</option>
          <option value='no'>미답변</option>
        </select>

        <select
          className='border rounded px-3 py-2'
          value={visibility}
          onChange={(e) =>
            setVisibility(e.target.value as "all" | "visible" | "hidden")
          }
        >
          <option value='all'>노출(전체)</option>
          <option value='visible'>표시</option>
          <option value='hidden'>숨김</option>
        </select>
      </div>

      <CommunityAdminTable filter={{ category, answered, visibility }} />
    </div>
  );
}
