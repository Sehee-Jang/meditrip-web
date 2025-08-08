"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import SearchInput from "@/components/common/SearchInput";
import CategorySection from "@/components/main/CategorySection";
import GroupedVideoSection from "@/components/contents/GroupedVideoSection";
import CommonButton from "../common/CommonButton";
import type { CategoryKey } from "@/constants/categories";
type Props = {
  initialKeyword?: string;
  initialSelectedCategories?: CategoryKey[];
};

const SearchableContents = ({
  initialKeyword = "",
  initialSelectedCategories = [],
}: Props) => {
  const t = useTranslations("contents-page");
  const [keyword, setKeyword] = useState(initialKeyword);
  const [selectedCategories, setSelectedCategories] = useState<CategoryKey[]>(
    initialSelectedCategories
  );

  return (
    <div className='flex flex-col gap-3 md:gap-11'>
      {/* 검색창 */}
      <div className='w-full md:max-w-md mx-auto mb-4'>
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder={t("searchPlaceholder")}
          className='mb-1'
        />
        <p className='text-sm text-center text-gray-500 mt-2'>
          {t("searchHelper")}
        </p>
      </div>

      {/* ✅ 콘텐츠 페이지에서만 다중 선택 활성화 */}
      <CategorySection
        selectable
        multiple
        mode='interactive'
        selected={selectedCategories}
        onChange={setSelectedCategories}
      />
      <GroupedVideoSection
        keyword={keyword}
        selectedCategories={selectedCategories}
      />

      {/* 더보기 버튼 (추후 서버 연동 시 무한스크롤/페이지네이션으로 교체) */}
      <div className='text-center'>
        <CommonButton className='w-24 w-full md:w-[120px]'>
          {t("viewMore")}
        </CommonButton>
      </div>
    </div>
  );
};

export default SearchableContents;
