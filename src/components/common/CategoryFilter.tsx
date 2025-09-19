import React from "react";

interface CategoryFilterProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export type HospitalCategoryKey =
  | "all"
  | "traditional"
  | "cosmetic"
  | "wellness";

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className='flex space-x-2 overflow-x-auto pb-2'>
      {categories.map((cat) => {
        const isActive = cat === selected;
        return (
          <button
            key={cat}
            onClick={() => onSelect(isActive ? null : cat)}
            className={`
              relative
              whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium
              transition
              ${
                isActive
                  ? "bg-[#4A90E2] text-white border-primary"
                  : "bg-background text-gray-700 border-border hover:bg-accent"
              }
            `}
          >
            {cat}
            {isActive && (
              // 언더라인
              <span className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-blue rounded-full' />
            )}
          </button>
        );
      })}
    </div>
  );
}
