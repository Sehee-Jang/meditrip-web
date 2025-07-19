"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CategorySection from "@/components/CategorySection";
import GroupedVideoSection from "@/components/GroupedVideoSection";

const SearchableContents = () => {
  const t = useTranslations("Contents");
  const [keyword, setKeyword] = useState("");

  return (
    <>
      {/* 검색창 */}
      <div className='max-w-md mx-auto mb-4'>
        <input
          type='text'
          placeholder={t("searchPlaceholder")}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className='w-full border p-2 rounded-md mb-6'
        />
        <p className='text-sm text-center text-gray-500 mt-2'>
          {t("searchHelper")}
        </p>
      </div>

      <CategorySection />
      <GroupedVideoSection keyword={keyword} />

      <div className='text-center mt-8'>
        <button className='bg-black text-white px-4 py-2 rounded'>
          {t("viewMore")}
        </button>
      </div>
    </>
  );
};

export default SearchableContents;
