import React from "react";

interface CategoryFilterProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

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
              whitespace-nowrap px-3 py-1 rounded-full border text-sm
              ${
                isActive
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-200"
              }
            `}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
