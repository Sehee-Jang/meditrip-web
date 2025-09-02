"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FilterRow, SelectFilter } from "../common/FilterControls";
import { CATEGORY_KEYS, CATEGORY_LABELS_KO } from "@/constants/categories";
import SearchInput from "@/components/common/SearchInput";
import IconOnlyAddButton from "../common/IconOnlyAddButton";
import WellnessTable from "./WellnessTable";
import { Wellness } from "@/types/wellness";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { listWellness } from "@/services/wellness/listWellness";
import WellnessFormDialog from "./WellnessFormDialog";

type CatFilter = "all" | (typeof CATEGORY_KEYS)[number];

export default function WellnessAdminClient() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [cat, setCat] = useState<CatFilter>("all");

  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ["admin-wellness", { cat, keyword }],
    // 관리자: 숨김 포함
    queryFn: () => listWellness({ includeHidden: true, limit: 100 }),
  });

  useEffect(() => {
    if (error) toast.error("목록을 불러오지 못했어요.");
  }, [error]);

  const items = useMemo<Wellness[]>(() => data?.items ?? [], [data]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const hasKw = kw.length > 0;

    return items.filter((w) => {
      // 카테고리ㅍ 필터(단일)
      const hitCat = cat === "all" ? true : w.category === cat;
      if (!hitCat) return false;

      // 키워드 없으면 카테고리만으로 통과
      if (!hasKw) return true
      
      // ko/ja + 카테고리 라벨/키 + 태그 검색
      const hitKw =
        w.title.ko.toLowerCase().includes(kw) ||
        w.title.ja.toLowerCase().includes(kw) ||
        w.excerpt.ko.toLowerCase().includes(kw) ||
        w.excerpt.ja.toLowerCase().includes(kw) ||
        w.body.ko.toLowerCase().includes(kw) ||
        w.body.ja.toLowerCase().includes(kw) ||
        CATEGORY_LABELS_KO[w.category].toLowerCase().includes(kw) ||
        w.category.toLowerCase().includes(kw) ||
        w.tags.some((t) => t.toLowerCase().includes(kw));
      return hitKw;
    });
  }, [items, keyword, cat]);

  return (
    <section className='space-y-4'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <FilterRow>
          <SearchInput
            value={keyword}
            onChange={setKeyword}
            placeholder='제목 검색'
            aria-label='제목 검색'
            className='w-[260px]'
          />
          <SelectFilter<CatFilter>
            value={cat}
            onChange={setCat}
            aria-label='카테고리'
            options={[
              { value: "all", label: "모든 카테고리" },
              ...CATEGORY_KEYS.map((k) => ({
                value: k,
                label: CATEGORY_LABELS_KO[k],
              })),
            ]}
            triggerClassName='h-9 w-[160px] text-[13px]'
          />
        </FilterRow>

        <div className='flex shrink-0 items-center gap-2'>
          <IconOnlyAddButton
            label='콘텐츠 추가'
            ariaLabel='콘텐츠 추가'
            onClick={() => setOpen(true)}
          />
        </div>
      </div>

      <WellnessTable
        items={filtered}
        totalCount={items.length}
        loading={isFetching}
        onChanged={() => void refetch()}
      />

      {/* 생성 다이얼로그 */}
      {open && (
        <WellnessFormDialog
          id='' // 빈 문자열이면 create 모드
          open
          onOpenChange={setOpen}
          onCreated={() => void refetch()}
        />
      )}
    </section>
  );
}


// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { FilterRow, SelectFilter } from "../common/FilterControls";
// import {
//   CATEGORY_KEYS,
//   CATEGORY_LABELS_KO,
//   type CategoryKey,
// } from "@/constants/categories";
// import SearchInput from "@/components/common/SearchInput";
// import IconOnlyAddButton from "../common/IconOnlyAddButton";
// import WellnessTable from "./WellnessTable";
// import { Wellness } from "@/types/wellness";
// import { useQuery } from "@tanstack/react-query";
// import { toast } from "sonner";
// import { listWellness } from "@/services/wellness/listWellness";
// import WellnessFormDialog from "./WellnessFormDialog";

// // type CatFilter = "all" | (typeof CATEGORY_KEYS)[number];
// type CatFilter = "all" | CategoryKey;

// /** LocalizedTextDoc → 검색용 문자열로 평탄화 */
// function flattenLocalized(doc: Wellness["title"]): string {
//   // 값 배열을 공백으로 합쳐 하나의 문자열로 만듦
//   return Object.values(doc ?? {})
//     .filter(Boolean)
//     .join(" ");
// }

// export default function WellnessAdminClient() {
//   const [open, setOpen] = useState(false);
//   const [keyword, setKeyword] = useState("");
//   const [cat, setCat] = useState<CatFilter>("all");

//   const { data, isFetching, refetch, error } = useQuery({
//     queryKey: ["admin-wellness", { cat, keyword }],
//     // 관리자: 숨김 포함
//     queryFn: () => listWellness({ includeHidden: true, limit: 100 }),
//   });

//   useEffect(() => {
//     if (error) toast.error("목록을 불러오지 못했어요.");
//   }, [error]);

//   const items = useMemo<Wellness[]>(() => data?.items ?? [], [data]);

//   const filtered = useMemo(() => {
//     const kw = keyword.trim().toLowerCase();
//     const hasKw = kw.length > 0;

//     // 단일 카테고리
//     return items.filter((v) => {
//       const passCat = cat === "all" || v.category === cat;
//       if (!passCat) return false;
//       if (!hasKw) return true;

//       const titleText = flattenLocalized(v.title).toLowerCase();
//       const excerptText = flattenLocalized(v.excerpt).toLowerCase();
//       const bodyText = flattenLocalized(v.body).toLowerCase();
//       const catLabelText =
//         CATEGORY_LABELS_KO[v.category]?.toLowerCase() ?? v.category;

//       const haystack = [
//         titleText,
//         excerptText,
//         bodyText,
//         catLabelText,
//         v.tags.join(" ").toLowerCase(),
//       ].join(" ");
//       return haystack.includes(kw);
//     });

//     // 다중 카테고리 대응
//     // return items.filter((v) => {
//     //   const inSelectedCategories =
//     //     cat === "all" ? true : v.categories?.includes(cat) ?? false;

//     //   if (!inSelectedCategory) return false;

//     //   // 키워드 없으면 카테고리 필터만 통과
//     //   if (kw.length === 0) return false;

//     //   // LocalizedTextDoc(제목/요약/본문) + 카테고리 라벨 + 태그까지 검색에 포함
//     //   const titleText = flattenLocalized(v.title).toLowerCase();
//     //   const excerptText = flattenLocalized(v.excerpt).toLowerCase();
//     //   const bodyText = flattenLocalized(v.body).toLowerCase();
//     //   const catKeys = v.categories ?? [];
//     //   const catLabelsText = catKeys
//     //     .map((k) => CATEGORY_LABELS_KO[k])
//     //     .join(" ")
//     //     .toLowerCase();
//     //   const tagsText = v.tags.join(" ").toLowerCase();

//     //   const haystack = `${titleText} ${excerptText} ${bodyText} ${catLabelsText} ${tagsText}`;
//     //   return haystack.includes(kw);
//     // });
//   }, [items, keyword, cat]);

//   return (
//     <section className='space-y-4'>
//       <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
//         <FilterRow>
//           <SearchInput
//             value={keyword}
//             onChange={setKeyword}
//             placeholder='제목/요약/본문/태그 검색'
//             aria-label='제목/요약/본문/태그 검색'
//             className='w-[260px]'
//           />
//           <SelectFilter<CatFilter>
//             value={cat}
//             onChange={setCat}
//             aria-label='카테고리'
//             options={[
//               { value: "all", label: "모든 카테고리" },
//               ...CATEGORY_KEYS.map((k) => ({
//                 value: k,
//                 label: CATEGORY_LABELS_KO[k],
//               })),
//             ]}
//             triggerClassName='h-9 w-[160px] text-[13px]'
//           />
//         </FilterRow>

//         <div className='flex shrink-0 items-center gap-2'>
//           <IconOnlyAddButton
//             label='콘텐츠 추가'
//             ariaLabel='콘텐츠 추가'
//             onClick={() => setOpen(true)}
//           />
//         </div>
//       </div>

//       <WellnessTable
//         items={filtered}
//         totalCount={items.length}
//         loading={isFetching}
//         onChanged={() => void refetch()}
//       />

//       {/* 생성 다이얼로그 */}
//       {open && (
//         <WellnessFormDialog
//           id='' // 빈 문자열이면 create 모드
//           open
//           onOpenChange={setOpen}
//           onCreated={() => void refetch()}
//         />
//       )}
//     </section>
//   );
// }
