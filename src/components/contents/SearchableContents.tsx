"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

  // URL 동기화 준비
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mountedRef = useRef(false);

  // 디바운스 타이머
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextQueryString = useMemo(() => {
    const params = new URLSearchParams(searchParams?.toString());
    // 키워드
    if (keyword.trim()) {
      params.set("q", keyword.trim());
    } else {
      params.delete("q");
    }
    // 카테고리(콤마 구분)
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    } else {
      params.delete("categories");
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [keyword, selectedCategories, searchParams]);

  // 상태 변경 시 URL replace (디바운스)
  useEffect(() => {
    // 첫 마운트 시에는 서버에서 초기값으로 이미 URL 반영되어 있으므로 스킵
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      router.replace(`${pathname}${nextQueryString}`);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [nextQueryString, pathname, router]);

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
