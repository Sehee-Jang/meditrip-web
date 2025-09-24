"use client";
import { useTranslations } from "next-intl";
import { CATEGORIES, type CategoryKey } from "@/constants/categories";

type Align = "left" | "center";

export function CategoryChips({
  value,
  onChange,
  onReset,
  align = "left",
}: {
  value: Set<CategoryKey>;
  onChange: (next: Set<CategoryKey>) => void;
  onReset?: () => void;
  align?: Align;
}) {
  const tCat = useTranslations("categories");
  const keys = Object.keys(CATEGORIES) as CategoryKey[];

  const innerAlign =
    align === "center" ? "justify-center md:justify-center" : "justify-start";

  return (
    <div className='-mx-3 px-3 overflow-x-auto md:overflow-visible '>
      <div
        className={`flex gap-2 whitespace-nowrap md:flex-wrap ${innerAlign}`}
      >
        {keys.map((k) => {
          const active = value.has(k);
          return (
            <button
              key={k}
              type='button'
              aria-pressed={active}
              onClick={() => {
                const next = new Set(value);
                if (active) {
                  next.delete(k);
                } else {
                  next.add(k);
                }
                onChange(next);
              }}
              className={[
                "rounded-full border px-3 py-1 text-xs md:text-sm transition-colors",
                active
                  ? "bg-gray-900 text-white border-border"
                  : "bg-background hover:bg-accent",
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
            className='rounded-full border px-3 py-1 text-xs md:text-sm text-muted-foreground hover:bg-accent'
          >
            {tCat("chipsReset")}
          </button>
        )}
      </div>
    </div>
  );
}
