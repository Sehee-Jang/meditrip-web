"use client";

import { useState } from "react";
import CommunityAdminTable from "./table/CommunityAdminTable";
import { COMMUNITY_CATEGORY_KEYS } from "@/constants/communityCategories";
import type { CommunityCategory } from "@/types/category";

type CategoryOption = "all" | CommunityCategory;

export interface AdminSearchParams {
  category?: string; // URL에서 들어와서 string 그대로 둠
  answered?: "all" | "yes" | "no";
  visibility?: "all" | "visible" | "hidden";
}

function toCategoryOption(v?: string): CategoryOption {
  if (!v || v === "all") return "all";
  return (COMMUNITY_CATEGORY_KEYS as readonly string[]).includes(v)
    ? (v as CategoryOption)
    : "all";
}

export default function CommunityAdminClient({
  initialSearchParams,
}: {
  initialSearchParams: AdminSearchParams;
}) {
  const [category, setCategory] = useState<CategoryOption>(
    toCategoryOption(initialSearchParams.category)
  );
  const [answered, setAnswered] = useState<"all" | "yes" | "no">(
    initialSearchParams.answered ?? "all"
  );
  const [visibility, setVisibility] = useState<"all" | "visible" | "hidden">(
    initialSearchParams.visibility ?? "all"
  );

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap gap-3 items-center'>
        <select
          className='border rounded px-3 py-2'
          value={category}
          onChange={(e) => setCategory(toCategoryOption(e.target.value))}
        >
          <option value='all'>전체 카테고리</option>
          {COMMUNITY_CATEGORY_KEYS.map((k) => (
            <option key={k} value={k}>
              {k}
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

      <CommunityAdminTable
        filter={{ category, answered, visibility }}
      />
    </div>
  );
}
