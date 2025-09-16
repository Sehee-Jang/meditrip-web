"use client";
import { useTranslations } from "next-intl";
import { CATEGORIES, type CategoryKey } from "@/constants/categories";

export function CategoryChips({
  value,
  onChange,
  onReset,
}: {
  value: Set<CategoryKey>;
  onChange: (next: Set<CategoryKey>) => void;
  onReset?: () => void;
}) {
  const tCat = useTranslations("categories");
  const keys = Object.keys(CATEGORIES) as CategoryKey[];

  return (
    <div className='-mx-3 px-3 overflow-x-auto md:overflow-visible'>
      <div className='flex gap-2 whitespace-nowrap md:flex-wrap'>
        {keys.map((k) => {
          const active = value.has(k);
          return (
            <button
              key={k}
              type='button'
              aria-pressed={active}
              onClick={() => {
                const next = new Set(value);
                active ? next.delete(k) : next.add(k);
                onChange(next);
              }}
              className={[
                "rounded-full border px-3 py-1 text-xs md:text-sm transition-colors",
                active
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white hover:bg-gray-50",
              ].join(" ")}
            >
              {tCat(k)}
            </button>
          );
        })}
        {onReset && value.size > 0 && (
          <button
            type='button'
            onClick={onReset}
            className='rounded-full border px-3 py-1 text-xs md:text-sm text-gray-600 hover:bg-gray-50'
          >
            초기화
          </button>
        )}
      </div>
    </div>
  );
}
