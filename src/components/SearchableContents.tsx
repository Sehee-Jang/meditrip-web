"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CategorySection from "@/components/CategorySection";
import GroupedVideoSection from "@/components/GroupedVideoSection";
import CommonButton from "./layout/CommonButton";

const SearchableContents = () => {
  const t = useTranslations("Contents");
  const [keyword, setKeyword] = useState("");

  return (
    <div className='flex flex-col gap-3 md:gap-11'>
      {/* 검색창 */}
      <div className='w-full md:max-w-md mx-auto mb-4'>
        <input
          type='text'
          placeholder={t("searchPlaceholder")}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className='w-full border p-2 rounded-md md:mb-6 mb-1'
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
