"use client";

import { useTranslations } from "next-intl";
import Container from "../common/Container";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  CategoryKey,
} from "@/constants/categories";
import clsx from "clsx";

const categoryKeys: CategoryKey[] = Object.keys(CATEGORIES) as CategoryKey[];

type Props = {
  /** 선택 UI를 켤지 여부 (기본 false → 메인페이지는 기존 그대로) */
  selectable?: boolean;
  /** 다중 선택 허용 여부 (콘텐츠 페이지에서만 true) */
  multiple?: boolean;
  /** 선택된 카테고리들 (selectable=true일 때만 사용) */
  selected?: CategoryKey[];
  /** 선택 변경 콜백 */
  onChange?: (nextSelected: CategoryKey[]) => void;
  className?: string;
};

export default function CategorySection({
  selectable = false,
  multiple = false,
  selected = [],
  onChange,
  className,
}: Props) {
  const t = useTranslations("categories");

  const handleClick = (key: CategoryKey) => {
    if (!selectable) return;
    if (!onChange) return;

    if (multiple) {
      const exists = selected.includes(key);
      const next = exists
        ? selected.filter((k) => k !== key)
        : [...selected, key];
      onChange(next);
    } else {
      const next = selected.includes(key) ? [] : [key];
      onChange(next);
    }
  };

  return (
    <section className='md:y-10 bg-white'>
      <Container className={clsx("px-0 md:px-6", className)}>
        <div className='grid grid-cols-5 gap-2 sm:gap-3 md:gap-4'>
          {categoryKeys.map((key) => {
            const Icon = CATEGORY_ICONS[key];
            const isActive = selectable && selected.includes(key);

            return (
              <button
                key={key}
                type='button'
                onClick={() => handleClick(key)}
                aria-pressed={isActive}
                className={clsx(
                  "h-[88px] flex flex-col items-center justify-center rounded-md border bg-white transition",
                  selectable ? "hover:border-gray-400" : "border-gray-200",
                  isActive
                    ? "border-gray-900 ring-2 ring-gray-900/10"
                    : "border-gray-200"
                )}
              >
                <Icon
                  size={24}
                  className={clsx(
                    "mb-1",
                    isActive ? "text-gray-900" : "text-gray-700"
                  )}
                />
                <span
                  className={clsx(
                    "text-xs font-medium",
                    isActive ? "text-gray-900" : "text-gray-800"
                  )}
                >
                  {t(key)}
                </span>
              </button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
