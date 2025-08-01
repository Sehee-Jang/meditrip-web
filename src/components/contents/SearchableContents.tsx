"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import SearchInput from "@/components/common/SearchInput";
import CategorySection from "@/components/main/CategorySection";
import GroupedVideoSection from "@/components/contents/GroupedVideoSection";
import CommonButton from "../common/CommonButton";

const SearchableContents = () => {
  const t = useTranslations("contents-page");
  const [keyword, setKeyword] = useState("");

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

      <CategorySection />
      <GroupedVideoSection keyword={keyword} />

      {/* 더보기 버튼 */}
      <div className='text-center'>
        <CommonButton className='w-24 w-full md:w-[120px]'>
          {t("viewMore")}
        </CommonButton>
      </div>
    </div>
  );
};

export default SearchableContents;
