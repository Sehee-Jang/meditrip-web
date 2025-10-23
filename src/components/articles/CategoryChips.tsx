"use client";

import { useTranslations } from "next-intl";
import { CATEGORIES, type CategoryKey } from "@/constants/categories";
import clsx from "clsx";

type Align = "left" | "center";

type Props = {
  value: Set<CategoryKey>;
  onChange: (next: Set<CategoryKey>) => void;
  onReset?: () => void;
  align?: Align;
  showAllTab?: boolean;
};

export function CategoryChips({
  value,
  onChange,
  onReset,
  align = "left",
  showAllTab = true,
}: Props) {
  const tCat = useTranslations("categories");
  const keys = Object.keys(CATEGORIES) as CategoryKey[];

  // 모바일은 가로 스크롤이므로 반드시 왼쪽 시작
  const justifyDesktop =
    align === "center" ? "md:justify-center" : "md:justify-start";

  const base =
    "inline-flex items-center h-9 rounded-full px-3 text-sm transition-colors border bg-background";
  const active = "border-transparent bg-foreground text-background shadow";
  const inactive = "border-border/70 text-foreground hover:bg-muted/80";

  return (
    <div
      className={clsx(
        "overflow-x-auto md:overflow-visible", // 모바일만 스크롤
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "py-2 md:px-0" // 안전 여백, -mx 제거
      )}
    >
      <div
        role='tablist'
        aria-label={tCat("chipsAria") ?? "카테고리"}
        className={clsx(
          "flex gap-2 whitespace-nowrap md:flex-wrap",
          "justify-start", // 모바일: 항상 왼쪽 시작
          justifyDesktop // 데스크톱: 옵션(좌/중앙)
        )}
      >
        {showAllTab && (
          <button
            type='button'
            role='tab'
            aria-selected={value.size === 0}
            onClick={() => {
              onReset?.();
              if (!onReset) onChange(new Set());
            }}
            className={clsx(base, value.size === 0 ? active : inactive)}
          >
            {tCat("all", { default: "전체보기" })}
          </button>
        )}

        {keys.map((k) => {
          const isOn = value.has(k);
          return (
            <button
              key={k}
              type='button'
              role='tab'
              aria-selected={isOn}
              onClick={() => {
                const next = new Set(value);
                if (isOn) next.delete(k);
                else next.add(k);
                onChange(next);
              }}
              className={clsx(base, isOn ? active : inactive)}
            >
              {tCat(k)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
